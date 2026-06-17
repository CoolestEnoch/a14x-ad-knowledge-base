# 4.10 闭环端到端（bench2drive）

录制：B7-宋子盈1的快速会议（bench2drive）

日期：2024-11-28 20:02:17

录制文件：[https://meeting.tencent.com/crm/2993PPjQ3e](https://meeting.tencent.com/crm/2993PPjQ3e)

### 实验复现
### 1.环境安装
(1) 建议使用python=3.8的环境-----------稳定

```plain
conda create -n b2d_zoo python=3.8
conda activate b2d_zoo
```

(2) 安装pytorch ,对应好自己的cuda版本和python版本即可

(3) 安装**<font style="color:rgb(31, 35, 40);">ninja and packaging</font>**

```plain
pip install ninja packaging
```

(4) 克隆代码并编译

```plain
git clone https://github.com/Thinklab-SJTU/Bench2DriveZoo.git
cd Bench2DriveZoo
mkdir ckpts
# Download resnet50-19c8e357.pth from link_1
# Download r101_dcn_fcos3d_pretrain.pth from link_2
cd ..
pip install -v -e .
```

### 2.安装carla
```plain
cd Bench2DriveZoo
mkdir carla
cd carla
wget https://carla-releases.s3.us-east-005.backblazeb2.com/Linux/CARLA_0.9.15.tar.gz
tar -xvf CARLA_0.9.15.tar.gz
cd Import && wget https://carla-releases.s3.us-east-005.backblazeb2.com/Linux/AdditionalMaps_0.9.15.tar.gz
cd .. && bash ImportAssets.sh
export CARLA_ROOT=YOUR_CARLA_PATH

## Important!!! Otherwise, the python environment can not find carla package
echo "$CARLA_ROOT/PythonAPI/carla/dist/carla-0.9.15-py3.7-linux-x86_64.egg" >> YOUR_CONDA_PATH/envs/YOUR_CONDA_ENV_NAME/lib/python3.8/site-packages/carla.pth # python 3.8 also works well, please set YOUR_CONDA_PATH and YOUR_CONDA_ENV_NAME
```

### 3.准备数据集
目前 4090服务器上已经具有符合训练格式的数据，在/data/songziying/data/Bench2Drive-base/data/carla_data_jay/v1 路径下，如果在同一台服务器上实验，使用软连接进行链接。如果想迁移到其他服务器上，建议使用scp传输命令。不建议个人下载上传(需要额外转换格式)

(1) 准备好数据集后,,生成PKL

```plain
cd Bench2DriveZoo/mmcv/datasets
python prepare_B2D.py --workers 16   # workers used to prepare data
```

### 4.训练（Bench2DriveZoo）
以VAD为例子，train执行以下命令

```plain
./adzoo/vad/dist_train.sh ./adzoo/vad/configs/VAD/VAD_base_e2e_b2d.py  1
```

Sparsedrive为例子，train执行以下命令

```plain
./adzoo/sparsedrive/dist_train.sh ./adzoo/sparsedrive/configs/sparsedrive_small_b2d_stage2.py 1
```

开环评估执行以下命令

```plain
./adzoo/vad/dist_test.sh ./adzoo/vad/configs/VAD/VAD_base_e2e_b2d.py 1
```

### 5.闭环测试（Bench2Drive）
(1) 克隆测试代码并链接其中的代码到Bench2DriveZoo文件夹下，具体命令复制以下并执行

```plain
git clone https://github.com/Thinklab-SJTU/Bench2Drive.git
# Add your agent code
cd Bench2Drive/leaderboard
mkdir team_code
ln -s Bench2DriveZoo/team_code/* ./team_code    # link UniAD,VAD agents and utils 
cd ..
ln -s Bench2DriveZoo  ./                        # link entire repo to Bench2Drive. 
```

（2）测试

```plain
bash leaderboard/scripts/run_evaluation_multi_vad.sh
```





> 更新: 2025-01-15 15:19:53  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/slwxz0y8u0660x04>