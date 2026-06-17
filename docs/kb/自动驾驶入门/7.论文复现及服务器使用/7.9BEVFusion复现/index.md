# 7.9 BEVFusion复现

## 环境问题

出现的问题比较多，记录下可使用的环境。

CUDA 11.3，pytorch 10.1

1. Docker(推荐)

官方给出了配置文件 bevfusion/docker/Dockerfile

注意启动容器时，要指定可用的gpu，否则找不到显卡无法跑。

2. Conda

Dockerfile 内 根据pip 安装指定版本即可。

### 环境常见错误

#### 1.  AttributeError:module 'distutils' has no attribute 'version

```python
File "train.py", line 20, in <module>
	from torch.utils.tensorboard import SummaryWriter
		File "/group/dphi_algo_scratch_10/xxx/anaconda3/envs/pt110/lib/python3.8/site-packages/torch/utils/tensorboard/__init__.py", line 4, in <module>
		LooseVersion = distutils.version.LooseVersion
		AttributeError: module 'distutils' has no attribute 'version'

```

原因：setuptools版本过高

解决办法：安装低版本setuptools < 60

```markdown
pip uninstall setuptools
pip install setuptools==59.5.0
```

#### 2. mcvv-full 出现问题

卸载，pip清除缓存重新安装编译

```markdown
pip uninstall mmcv-full - y
pip --no-cache-dir install mmcv-full==1.4.0
```

#### 3. 编译文件错误。

30系显卡在编译时会出现的问题，将mmdet3d/ops/spconv/src/indice\_cuda.cu下的4096全部替换为256后重新编译。[issues#148@BII-wushuang提供的解决方式](https://github.com/mit-han-lab/bevfusion/issues/148)

```markdown
    outids, indice_pairs, indice_pair_num = ops.get_indice_pairs(
  File "/home/s0001038/repos/github/bevfusion/mmdet3d/ops/spconv/ops.py", line 92, in get_indice_pairs
    return get_indice_pairs_func(
RuntimeError: mmdet3d/ops/spconv/src/indice_cuda.cu 124
cuda execution failed with error 2
--------------------------------------------------------------------------
Primary job  terminated normally, but 1 process returned
a non-zero exit code. Per user-direction, the job has been aborted.
--------------------------------------------------------------------------
--------------------------------------------------------------------------
mpirun detected that one or more processes exited with non-zero status, thus causing
the job to be terminated. The first process to do so was:

  Process name: [[25106,1],0]
  Exit code:    1
```

## 运行

Nusences数据集全量运行时长，8卡 3090并行时间需要大概37小时左右。

融合模型检测复现所需条件

1. 需要加载 [LiDAR-Only Baseline](https://github.com/mit-han-lab/bevfusion/blob/main/configs/nuscenes/det/transfusion/secfpn/lidar/voxelnet_0p075.yaml)（可自己训练后加载or直接加载官方pth）

增加加载预训练模型命令  `--load_from [pth]`

2. 需要更改 convfuser.yaml(官方预计2022-11月末放出完整yaml)

路径 `bevfusion/configs/nuscenes/det/transfusion/secfpn/camera+lidar/swint_v0p075/convfuser.yaml`（论文内提供相关参数，更改需要了解 [mmdet3d框架](https://github.com/open-mmlab/mmdetection3d)。）


> 更新: 2023-05-05 14:05:08  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/yhp6zh_buu9ty>