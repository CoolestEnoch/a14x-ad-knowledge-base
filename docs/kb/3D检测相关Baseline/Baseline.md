# Baseline


## KITTI

| |A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z|
|--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |---|
| 1 | 排名 | 模型 | AP40（3D） |  |  | 速度 | 数据集 | 输入类型 | 代码 | 单位 | 年份 | 说明 | 论文 | 复现负责人 |  |  |  |  |  |  |  |  |  |  |  | |
| 2 | 3 | SFD | 91.73 | 84.76 | 77.92 | 10.2 | KITTI | L+I | 开源 | 浙江大学 | 2022 CVPR | 使用了密集深度图 baseline VoxelRCNN | Sparse Fuse Dense: Towards High Quality 3D Detection with  Depth Completion | 张国欣 |  |  |  |  |  |  |  |  |  |  |  | |
| 3 | 11 | VPFNet | 91.02 | 83.21 | 78.2 | 15 | KITTI | L+I | 无 | 中国科学技术大学 | 2021 CVPR | 论文数据与榜单一致,Stereo图 | VPFNet: Improving 3D Object Detection with Virtual Point based  LiDAR and Stereo Data Fusion |  |  |  |  |  |  |  |  |  |  |  |  | |
| 4 | 14 | BtcDet | 90.64 | 82.86 | 78.09 | 11.1 | KITTI Waymo | L | 开源 | USC | 2022 AAAI | Openpcdet | Behind the Curtain: Learning Occluded Shapes for 3D Object  Detection |  |  |  |  |  |  |  |  |  |  |  |  | |
| 5 | 20 | SPG mini | 90.64 | 82.66 | 77.91 | 11.1 | KITTI |  | 无 | USC waymo实习 | 2021 ICCV | 论文中没有公开SPG mini信息 | SPG: Unsupervised Domain Adaptation for 3D Object Detection  via Semantic Point Generation |  |  |  |  |  |  |  |  |  |  |  |  | |
| 6 | 38 | SPG+PVRCNN | 90.5 | 82.13 | 78.9 |  | KITTI |  | 无 |  | 2022 ICCV | 论文中的数据与榜单一致 |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 7 | 24 | SE-SSD | 91.49 | 82.54 | 77.15 | 32 | KITTI | L | 开源 | 香港中文大学 | 2021 CVPR | det3d | SE-SSD: Self-Ensembling Single-Stage Object Detector From  Point Cloud |  |  |  |  |  |  |  |  |  |  |  |  | |
| 8 | 26 | DVF-V | 89.4 | 82.45 | 77.56 | 10 | KITTI Waymo | L+I | 无 | 多伦多大学 | 2022 CVPR |  | Dense Voxel Fusion for 3D Object Detection |  |  |  |  |  |  |  |  |  |  |  |  | |
| 9 | 31 | Focals Conv | 90.55 | 82.28 | 77.59 | 10 | KITTI nuScenes Waymo | L、L+I | 开源 | 香港中文大学 旷视 | 2022 CVPR | 一种新的卷积方式，将图像信息融合进来 |  | 张国欣 |  |  |  |  |  |  |  |  |  |  |  | |
| 10 | 30 | CLOCs | 89.16 | 82.28 | 77.23 | 10 | KITTI | L+I | 开源 | 密歇根 | 2020 IROS | codebase second |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 11 | 39 | VOTR | 89.9 | 82.09 | 79.14 | 14.65 | KITTI Waymo | L | 开源 | 香港中文大学 | 2021 ICCV | Transformer |  Voxel  Transformer for 3D Object Detection | 张国欣 |  |  |  |  |  |  |  |  |  |  |  | |
| 12 | 42 | Pyramid R-CNN | 88.39 | 82.08 | 77.49 | 8.92 | KITTI Waymo | L | 无 | 香港中文大学 | 2021 ICCV |  | Pyramid R-CNN:Towards Better Performance and Adaptability for 3D Object Detection |  |  |  |  |  |  |  |  |  |  |  |  | |
| 13 | 44 | VoxSeT | 88.53 | 82.06 | 77.46 | 29 | KITTI | L | 无 | 香港理工大学 | 2022 CVPR | Transformer | Voxel Set Transformer: A Set-to-Set Approach to 3D Object Detection from Point Clouds | 毕江峰 |  |  |  |  |  |  |  |  |  |  |  | |
| 14 | 47 | EQ-PVRCNN | 90.13 | 82.01 | 77.53 | 5 | KITTI | L | 开源 | 香港中文大学 | 2022 CVPR |  | A  Unified Query-based Paradigm for Point Cloud Understanding |  |  |  |  |  |  |  |  |  |  |  |  | |
| 15 | 50 | EPNet++ | 91.37 | 81.96 | 76.71 | 10 | KITTI | L+I | 无 | 香港科技大学 | 2021 |  | EPNet++: Cascade Bi-directional Fusion for Multi-Modal 3D  Object Detection |  |  |  |  |  |  |  |  |  |  |  |  | |
| 16 |  | PVRCNN++ | 90.14 | 81.88 | 77.15 | 16 | KITTI | L |  | 史少帅 |  | 只有代码 |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 17 | 54 | PDV | 90.43 | 81.86 | 77.36 | 10 | KITTI Waymo | L | 开源 | 多伦多大学 | 2022 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 18 | 59 | CT3D | 87.83 | 81.77 | 77.16 | 14 | KITTI Waymo | L | 开源 | 浙江大学 阿里巴巴 | 2021 ICCV | Transformer |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 19 | 64 | M3DeTR | 90.28 | 81.73 | 76.96 |  | KITTI Waymo | L | 开源 | 马里兰大学 复旦大学 | 2022 WACV | Transformer |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 20 | 66 | SIENet | 88.22 | 81.71 | 77.22 | 12 | KITTI Waymo | L | 开源 | 东南大学自动驾驶 | 2021 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 21 | 70 | Voxel R-CNN | 90.9 | 81.62 | 77.06 | 25 | KITTI Waymo | L | 开源 | 中国科技大学史少帅 | 2021 AAAI | Waymo 只做了测试集 |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 22 | 71 | BADet | 89.28 | 81.61 | 76.58 | 7 | KITTI nuScenes | L | 开源 | 中国人民大学 | 2022 PR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 23 | 74 | FromVoxelToPoint | 88.53 | 81.58 | 77.37 | 10 | KITTI Waymo | L | 开源 | 浙江大学 IIAI | 2021 ACM MM |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 24 | 75 | H^23D R-CNN | 90.43 | 81.55 | 77.22 | 33 | KITTI Waymo | L | 开源 | 中国科技大学 | 2021 IEEE TCSVT |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 25 | 77 | DSA-PV-RCNN | 88.25 | 81.46 | 76.96 | 12 | KITTI | L | 开源 | 滑铁卢大学 | 2021  ICCV | baseline PVRCNN |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 26 | 78 | P2V-RCNN | 88.34 | 81.45 | 77.20 | 10 |  |  | 无 |  | 2021 Access |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 27 | 79 | PVRCNN | 90.25 | 81.43 | 76.82 | 12 | KITTI Waymo | L | 开源 | 香港中文大学史少帅 | 2020 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 28 | 81 | XView | 89.21 | 81.35 | 76.87 | 10 | KITTI nuScenes | L | 无 | IEEE member | 2021 CVPR | baseline PVRCNN 多视角 |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 29 | 83 | RangeRCNN | 88.47 | 81.33 | 77.09 | 16 | KITTI | L | 无 | 海康威视 | 2020 CVPR | RangeImage |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 30 | 84 | CAT-Det | 89.87 | 81.32 | 76.68 | 3 | KITTI | L+I | 无 | 北航 软件开发环境国家重点实验室 | 2022 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 31 | 88 | VPFNet | 88.51 | 80.97 | 76.74 | 5 | KITTI | L+I | 无 | 国立台湾大学 | 2021 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |

## nuScenes

| |A | B | C | D | E | F | G | H | I | J | K|
|--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |---|
| 1 | 模型 | mAP | NDS | FPS | 类型 | 年份 | 单位 | 说明 | 论文 |  | |
| 2 | DeepInteraction-e | 0.756 | 0.763 |  | L+C | 2022 | 复旦 阿里 | 还没放出论文和代码,融合榜第一 |  |  | |
| 3 | BEVFusion-e | 0.075 | 0.761 |  | L+C | 2022 arXiv | MIT |  |  |  | |
| 4 | BEVFusion | 0.702 | 0.729 | 8.4 | L+C | 2022 arXiv |  |  |  |  | |
| 5 | TransFusion | 0.689 | 0.717 |  | L+C | 2022 CVPR | 香港中文大学 | Transformer |  |  | |
| 6 | FusionPainting | 0.681 | 0.716 |  | L+C | 2021 ITCS |  | 明确表示不能开源代码 |  |  | |
| 7 | CenterPoint v2 | 0.671 | 0.714 |  | L+C | 2021 CVPR | 得克萨斯大学Austin |  |  |  | |
| 8 | UVTR-Multimodality | 0.671 | 0.711 |  | L+C | 2022 arXiv |  |  |  |  | |
| 9 | VISTA | 0.637 | 0.704 |  | L | 2022 |  |  |  |  | |
| 10 | TransFusion-L | 0.655 | 0.702 |  | L | 2022 CVPR |  |  |  |  | |
| 11 | UVTR-LiDAR | 0.639 | 0.697 |  | L | 2022 |  |  |  |  | |
| 12 | AFDetV2 | 0.624 | 0.685 |  | L | 2021 |  |  |  |  | |
| 13 | CenterPoint-Ensemble | 0.611 | 0.675 |  | L+R | 2020 |  |  |  |  | |
| 14 | MEGVII | 0.528 | 0.633 |  | L | 2019 |  |  |  |  | |
| 15 | SSN v2 | 0.506 | 0.616 |  | L | 2020 |  |  |  |  | |
| 16 | SSL_CP_Flow | 0.514 | 0.609 |  | L | 2022 |  |  |  |  | |
| 17 | RAANet | 0.620 | 0.583 | 16-22 | L | 2021 |  |  |  |  | |
| 18 | BEVDet4D | 0.451 | 0.569 | tiny 15 Base 1.9 | I | 2022 |  |  |  |  | |
| 19 |  |  |  |  |  |  |  |  |  |  | |
| 20 |  |  |  |  |  |  |  |  |  |  | |
| 21 |  |  |  |  |  |  |  |  |  |  | |
| 22 | CenterPoint | 58.0 | 65.5 | 11 | L | 2021 CVPR | Tianwei Yin | nuS中常用的baseline | [https://arxiv.org/abs/2006.11275](https://arxiv.org/abs/2006.11275) |  | |
| 23 | nus val 结果 |  |  |  |  |  |  |  |  |  | |
| 24 | CenterPoint | 57.1 | 65.4 |  |  |  |  |  |  |  | |
| 25 | + PointPainting | 62.7 | 68.0 |  |  |  |  | 用CascadeRCNN在nuImage训练的分割模型 |  |  | |
| 26 | + Double FlipTest | 64.9 | 69.4 |  |  |  |  | TTA Double Flip |  |  | |
| 27 | + Rotation | 66.2 | 70.3 |  |  |  |  | TTA Point-cloud rotation yaw [0 6, 25, 12.5, 25] |  |  | |
| 28 | + Ensamble | 67.7 | 71.4 |  |  |  |  | 5个模型融合 VoxelSize [0.05m, 0.05m] to [0.15m, 0.15m] |  |  | |
| 29 | + Filter Empty | 68.2 | 71.7 |  |  |  |  | CenterPointV2 过滤掉空点产生的预测 |  |  | |
| 30 | nus test 结果 |  |  |  |  |  |  |  |  |  | |
| 31 | CenterPoint V2 | 67.1 | 71.4 |  |  |  |  |  |  |  | |
| 32 |  |  |  |  |  |  |  |  |  |  | |
| 33 | MVP | 66.4 | 70.5 |  | LC | 2021 NIPS | Tianwei Yin | 虚拟点 |  |  | |
| 34 | Transfusion-L | 65.5 | 70.2 |  | L | 2022 CVPR | Xuyang Bai | 新的 basleine center+detr结合 被bevfusion等新SOTA follow |  |  | |
| 35 | Transfusion | 68.9 | 71.7 |  | LC | 2022 CVPR | Xuyang Bai | 将图像融合进来，用cross att |  |  | |
| 36 | BEVFusion | 70.23 | 72.88 |  |  |  |  |  |  |  | |

## 复现KITTI

| |A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z|
|--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |---|
| 1 | 排名 | 模型 | AP40（3D） |  |  | 速度 | 数据集 | 输入类型 | 代码 | 单位 | 年份 | 说明 | 论文 | 复现负责人 |  |  |  |  |  |  |  |  |  |  |  | |
| 2 | 70 | Voxel R-CNN | 88.64 | 81.10 | 76.78 | 25 | KITTI Waymo | L | 开源 | 中国科技大学史少帅 | 2021 AAAI | Waymo 只做了测试集 | Voxel R-CNN: Towards High Performance Voxel-based 3D Object Detection | 魏海跃 |  |  |  |  |  |  |  |  |  |  |  | |
| 3 | 39 | VOTR - ssd | 87.12 | 76.43 | 71.27 | 14.65 | KITTI Waymo | L | 开源 | 香港中文大学 | 2021 ICCV | Transformer | Voxel  Transformer for 3D Object Detection | 魏海跃 |  |  |  |  |  |  |  |  |  |  |  | |
| 4 | 3 | SFD | 89.45 | 81.55 | 78.59 | 10.2 | KITTI | L+I | 开源 | 浙江大学 | 2022 CVPR | 使用了密集深度图 baseline VoxelRCNN | Sparse Fuse Dense: Towards High Quality 3D Detection with  Depth Completion | 魏海跃 |  |  |  |  |  |  |  |  |  |  |  | |


> 更新: 2023-07-10 16:35:19  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/uc9e11/kh866q>