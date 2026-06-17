# BEVFusion复现-daixinguang

**代码：**

```plain
git clone https://github.com/mit-han-lab/bevfusion.git
or
scp -r fu@10.110.132.186:/sda/dxg/bevfusion-mit230202/bevfusion target-file
```

**数据集：nuScenes**

```plain
# 直接处理好的数据集
rsync -av fu@10.110.132.186:/sda/dataset/nuscenes target-file
# 拷贝原始数据集压缩包
rsync -av fu@10.110.132.186:/sda/dataset/nuscenes-pkg target-file
bash target-file/extract_nuscenes.sh /sda/dataset/nuscenes
## !!!等环境配置完之后，还需要执行`tools/create_data.py`生成*.json文件
python tools/create_data.py nuscenes --root-path /sda/dataset/nuscenes --out-dir /sda/dataset/nuscenes --extra-tag nuscenes
```

## 快速搭建环境

```bash
conda create -n bev-mit-dxg python=3.8 -y
conda activate bev-mit-dxg


pip install torch==1.10.0+cu111 torchvision==0.11.0+cu111 torchaudio==0.10.0 -f https://download.pytorch.org/whl/torch_stable.html # 1.9.1的torch.meshgrid和论文参数不一致，安装1.10.0


pip install mmcv-full==1.4.0 -f https://download.openmmlab.com/mmcv/dist/cu111/torch1.10/index.html # 要参照官网对应版本进行安装 https://mmcv.readthedocs.io/zh_CN/latest/get_started/installation.html
pip install mmdet==2.20.0
pip install tqdm
pip install torchpack
pip install nuscenes-devkit
conda install mpi4py
pip install ninja
pip install numba
// 顺次安装各种包
//对部分包降级进行兼容
pip uninstall setuptools -y
pip install setuptools==59.5.0
pip uninstall shapely -y
pip install shapely==1.8.0


vim ~/.bashrc        
在安装openmpi之前，需要修改环境变量，在末尾添加OMPI_MCA_opal_cuda_support=true
 
conda install openmpi    // 使用conda安装openmpi
 
在执行setup之前，需要在setup第25行添加本机显卡对应的算力设置，否则CUDA算力在编译的时候没有匹配
Ge TITAN X 对应算力为52  | RTX 3090 3080 对应算力为86 | A100 对应算力为80
添加"-gencode=arch=compute_52,code=sm_52",
添加"-gencode=arch=compute_86,code=sm_86",
 
python setup.py develop // 最后安装mmdet3d，编译通过
```

## 准备数据集

> **!!!** 如果使用的原始数据集解压的，需要执行`tools/create_data.py`生成\*.json文件\
> python tools/create\_data.py nuscenes --root-path /sda/dataset/nuscenes --out-dir /sda/dataset/nuscenes --extra-tag nuscenes

## train

> **配置文件修改:**\
> 1.修改数据集根路径`configs/nuscenes/default.yaml`的`dataset_root: /sda/dataset/nuscenes/`\
> 2.修改batchsize(训练传参的时候需要哪个yaml就改哪个yaml对应的`data.samples_per_gpu: 1`)

```plain
configs/nuscenes/default.yaml data.samples_per_gpu: 1 data.workers_per_gpu: 1
configs/nuscenes/det/centerhead/lssfpn/camera/256x704/swint/default.yaml data.samples_per_gpu: 1
```

### camera-only object detection

使用torchpack(np 后面的参数表示几张卡,单卡需要设为1，否则会卡住不报错)

```plain
torchpack dist-run -np 1 python tools/train.py configs/nuscenes/det/centerhead/lssfpn/camera/256x704/swint/default.yaml --model.encoders.camera.backbone.init_cfg.checkpoint pretrained/swint-nuimages-pretrained.pth
```

## debug

下列文件需要修改：\
tools/train.py

```plain
# line 21
# dist.init() # dxg


# line 34
torch.cuda.set_device(dist.local_rank()) -> torch.cuda.set_device(0)


# line 80
distributed=False, # dxg True -> False
```

mmdet3d/apis/train.py

```plain
# line 2
from mmcv.parallel import MMDistributedDataParallel, MMDataParallel # dxg add MMDataParallel


# line 37
num_gpus=1, # dxg None -> 1


# line 48 
"""
model = MMDistributedDataParallel(
        model.cuda(),
        device_ids=[torch.cuda.current_device()],
        broadcast_buffers=False,
        find_unused_parameters=find_unused_parameters,
    )
"""
if distributed: # dxg use MMDataParallel
    model = MMDistributedDataParallel(
        model.cuda(),
        device_ids=[torch.cuda.current_device()],
        broadcast_buffers=False,
        find_unused_parameters=find_unused_parameters,
    )
else:
    model = MMDataParallel(
        model.cuda(),
        device_ids=[0],
    )
```

mmdet3d/apis/test.py

## run

### camera-only segmentation

使用torchpack

```plain
torchpack dist-run -np 1 python tools/train.py configs/nuscenes/seg/camera-bev256d2.yaml --model.encoders.camera.backbone.init_cfg.checkpoint pretrained/swint-nuimages-pretrained.pth
```

不使用torchpack

```plain
torchpack dist-run -np 1 python tools/train.py configs/nuscenes/seg/camera-bev256d2.yaml --model.encoders.camera.backbone.init_cfg.checkpoint pretrained/swint-nuimages-pretrained.pth
```

### LiDAR-only detector

```plain
torchpack dist-run -np 1 python tools/train.py configs/nuscenes/det/transfusion/secfpn/lidar/voxelnet_0p075.yaml
```

### LiDAR-only BEV segmentation

```plain
torchpack dist-run -np 1 python tools/train.py configs/nuscenes/seg/lidar-centerpoint-bev128.yaml
```

### bevfusion detection

```plain
torchpack dist-run -np 1 python tools/train.py configs/nuscenes/det/transfusion/secfpn/camera+lidar/swint_v0p075/convfuser.yaml --model.encoders.camera.backbone.init_cfg.checkpoint pretrained/swint-nuimages-pretrained.pth --load_from pretrained/lidar-only-det.pth
```

### bevfusion segmentation

```plain
torchpack dist-run -np 1 python tools/train.py configs/nuscenes/seg/fusion-bev256d2-lss.yaml --model.encoders.camera.backbone.init_cfg.checkpoint pretrained/swint-nuimages-pretrained.pth
```


> 更新: 2024-01-27 22:45:16  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/gv5li665aqvthld8>