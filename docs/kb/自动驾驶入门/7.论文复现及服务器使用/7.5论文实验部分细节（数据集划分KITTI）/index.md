# 7.5 论文实验部分细节（数据集划分KITTI）

# 总结
由于早期KITTI 的 test 在线评估中没有 3D object detection标签，大部分论文在实验阶段将带有标签的训练数据 train/val 划分为 1:1 具体数字被提出是在VoxelNet中 3712/3769，用于

部分方法在提交榜单成绩时，会划分较多的数据集用于训练 例如 **80/20** **90/10。**

**2019年8月10日 KITTI官网test server 用40 recall position 代替了 11 recall position。**

# 3d-object-proposals-for-accurate-object-class-detection
**2015 NIPS**

![1655053973498-7f44f85f-8b88-493e-ae07-2da5abccbae7.png](./img/ntKU49uj4L0qQP9U/1655053973498-7f44f85f-8b88-493e-ae07-2da5abccbae7-492001.png)

1:1

# MV3D
**2017 CVPR**

![1655054172193-4ce7e18e-2e12-4300-8590-3a510b301b3f.png](./img/ntKU49uj4L0qQP9U/1655054172193-4ce7e18e-2e12-4300-8590-3a510b301b3f-111878.png)

**[4]  3d-object-proposals-for-accurate-object-class-detection**

**trian set**和**val set**每个大约占一半的训练数据

也就是**1:1**

# VoxelNet
**2018 CVPR**

![1655055243712-092d5c68-abc6-4673-b6d0-859c8c7faf4b.png](./img/ntKU49uj4L0qQP9U/1655055243712-092d5c68-abc6-4673-b6d0-859c8c7faf4b-752268.png)

![1655055261279-970b5d7e-b3f9-42d9-8711-700237f7ca97.png](./img/ntKU49uj4L0qQP9U/1655055261279-970b5d7e-b3f9-42d9-8711-700237f7ca97-804595.png)

一共7481个数据 分为3712 作为训练集 3769作为验证集

大约也是1:1

# SECOND
**2018 sensors**

![1655055890275-98932bb7-7fca-4050-8d2a-ecf0247dc110.png](./img/ntKU49uj4L0qQP9U/1655055890275-98932bb7-7fca-4050-8d2a-ecf0247dc110-836550.png)

红线部分

我们根据之前发布的方法[8]划分数据集 也就是MV3D中的划分方法

train:val = 3712:3769 ≈ 1:1

![1655056050576-7b64163b-3003-4aee-bc31-de7c571002ae.png](./img/ntKU49uj4L0qQP9U/1655056050576-7b64163b-3003-4aee-bc31-de7c571002ae-975558.png)

AVOD-FPN用了**85/15**的划分方式 而我们用的是**50/50**

# PointPillars
**2019 CVPR**

![1655056529948-c3407f59-c11a-4c69-aa4e-f4c6a3e22769.png](./img/ntKU49uj4L0qQP9U/1655056529948-c3407f59-c11a-4c69-aa4e-f4c6a3e22769-577899.png)

实验阶段用的trian/val划分为 ** 1:1**

提交榜单时使用的trian/val划分为 ** 6733/784 **≈** 9/1**

# PointRCNN
**2019 CVPR**

![1655057128588-9dcec274-9187-45df-825b-7a6506adb4da.png](./img/ntKU49uj4L0qQP9U/1655057128588-9dcec274-9187-45df-825b-7a6506adb4da-793069.png)

[4] MV3D

frequently used** train/val **split** 3172/3769**

# PV-RCNN
**2020 CVPR**

![1655057714165-c21d19e7-b2c2-4200-a1c7-bdfa09ca6f7f.png](./img/ntKU49uj4L0qQP9U/1655057714165-c21d19e7-b2c2-4200-a1c7-bdfa09ca6f7f-551017.png)

为了刷榜 **train/val**划分为 **80/20**

# Point GNN
**2020 CVPR**

![1655058402390-240f412e-023b-4543-89ca-4b0247094621.png](./img/ntKU49uj4L0qQP9U/1655058402390-240f412e-023b-4543-89ca-4b0247094621-182977.png)

消融实验中采用 **train/val** 划分为 **3712/3769**

提交test中没有细说

# PointPaint
**2020 CVPR**

![1655058553772-24e61ee8-4b50-4cc3-878c-632395c504ac.png](./img/ntKU49uj4L0qQP9U/1655058553772-24e61ee8-4b50-4cc3-878c-632395c504ac-060732.png)

提交test时 使用的划分为** 6733/784** 约等于 **90/10**

# PartA2
**2021 PAMI**

![1655058878972-16dfc098-8a98-4c64-8143-82f04d5ec27b.png](./img/ntKU49uj4L0qQP9U/1655058878972-16dfc098-8a98-4c64-8143-82f04d5ec27b-008353.png)

**3712 / 3769**

# Voxel RCNN
**2021 AAAI**

![1655058985783-96406d26-f4d9-4a72-a7fb-84660ff5c272.png](./img/ntKU49uj4L0qQP9U/1655058985783-96406d26-f4d9-4a72-a7fb-84660ff5c272-919928.png)

提交测试时 使用的划分为 **80/20**

# IA-SSD
**2022 CVPR**

****

实验部分用的是** 1/1 **划分

提交test时的划分没有说明

# VoxSeT
**2022 CVPR**

![1655059860637-89879c52-4687-4cb3-a149-46948bee3c80.png](./img/ntKU49uj4L0qQP9U/1655059860637-89879c52-4687-4cb3-a149-46948bee3c80-567234.png)

实验阶段 **3712/3769 划分**

# 总结
由于早期KITTI 的 test 在线评估中没有 3D object detection标签，大部分论文在实验阶段将带有标签的训练数据 train/val 划分为 1:1 具体数字被提出是在VoxelNet中 3712/3769，用于

部分方法在提交榜单成绩时，会划分较多的数据集用于训练 例如 **80/20** **90/10。**

**2019年8月10日 KITTI官网test server 用40 recall position 代替了 11 recall position。**

****



> 更新: 2024-08-14 21:00:58  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/ogh93q_urzuv5>