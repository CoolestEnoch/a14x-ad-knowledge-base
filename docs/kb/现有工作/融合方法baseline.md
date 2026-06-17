# 融合方法baseline


## kitti

| |A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z|
|--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |---|
| 1 | 排名 | 模型 | AP40（3D） |  |  | 速度 | 数据集 | 输入类型 | 代码 | 单位 | 年份 | 说明 | 论文 |  |  |  |  |  |  |  |  |  |  |  |  | |
| 2 | 3 | SFD | 91.73 | 84.76 | 77.92 | 10.2 | KITTI | L+I | 开源 | 浙江大学 | 2022 CVPR | 使用了密集深度图 baseline VoxelRCNN | Sparse Fuse Dense: Towards High Quality 3D Detection with  Depth Completion |  |  |  |  |  |  |  |  |  |  |  |  | |
| 3 | 6 | CasA++ |  |  |  | 10 | KITTI Waymo | L | 开源 | 厦门大学 | 2022 IEEE Transactions on Geoscience and Remote Sensing |  | CasA: A Cascade Attention Network for 3-D Object Detection From LiDAR Point Clouds |  |  |  |  |  |  |  |  |  |  |  |  | |
| 4 | 9 | GraR-Vol(Graph R-CNN) | 91.89 | 83.27 | 77.78 | 14.2 | KITTI Waymo | L+I | 开源 | 浙江大学 | 2022 ECCV |  | Graph R-CNN: Towards Accurate 3D Object Detection with Semantic-Decorated Local Graph |  |  |  |  |  |  |  |  |  |  |  |  | |
| 5 | 11 | VPFNet | 91.02 | 83.21 | 78.20 | 16.7 | KITTI | L+I | 开源 | 中国科学技术大学 | 2022 IEEE Transactions on Multimedia |  | VPFNet: Improving 3D Object Detection with Virtual Point based LiDAR and Stereo Data Fusion |  |  |  |  |  |  |  |  |  |  |  |  | |
| 6 | 12 | GraR-Po(Graph R-CNN) | 91.79 | 83.18 | 77.98 | 16.7 | KITTI Waymo | L+I | 开源 | 浙江大学 | 2022 ECCV |  | Graph R-CNN: Towards Accurate 3D Object Detection with Semantic-Decorated Local Graph |  |  |  |  |  |  |  |  |  |  |  |  | |
| 7 | 13 | CasA | 91.58 | 83.06 | 80.08 | 10 | KITTI Waymo | L | 开源 | 厦门大学 | 2022 IEEE Transactions on Geoscience and Remote Sensing |  | CasA: A Cascade Attention Network for 3-D Object Detection From LiDAR Point Clouds |  |  |  |  |  |  |  |  |  |  |  |  | |
| 8 | 15 | BtcDet | 90.64 | 82.86 | 78.09 | 11.1 | KITTI Waymo | L | 开源 | USC | 2022 AAAI | Openpcdet | Behind the Curtain: Learning Occluded Shapes for 3D Object  Detection |  |  |  |  |  |  |  |  |  |  |  |  | |
| 9 | 17 | GraR-Vo(Graph R-CNN) | 91.29 | 82.77 | 77.20 | 25 | KITTI Waymo | L+I | 开源 | 浙江大学 | 2022 ECCV |  | Graph R-CNN: Towards Accurate 3D Object Detection with Semantic-Decorated Local Graph |  |  |  |  |  |  |  |  |  |  |  |  | |
| 10 | 22 | SPG mini | 90.64 | 82.66 | 77.91 | 11.1 | Waymo | L | 开源 | USC | 2021 ICCV |  | SPG: Unsupervised Domain Adaptation for 3D Object Detection via Semantic Point Generation |  |  |  |  |  |  |  |  |  |  |  |  | |
| 11 | 28 | SE-SSD | 91.49 | 82.54 | 77.15 | 32 | KITTI | L | 开源 | 香港中文大学 | 2021 CVPR | det3d | SE-SSD: Self-Ensembling Single-Stage Object Detector From  Point Cloud |  |  |  |  |  |  |  |  |  |  |  |  | |
| 12 | 30 | DVF-V | 89.40 | 82.45 | 77.56 | 10 | KITTI Waymo | L+I | 开源 | the University of Toronto | 2022 arxiv |  | Dense Voxel Fusion for 3D Object Detection |  |  |  |  |  |  |  |  |  |  |  |  | |
| 13 | 31 | GraR-Pi | 90.94 | 82.42 | 77.00 | 33.3 | KITTI Waymo | L+I | 开源 | 浙江大学 | 2022ECCV |  | Graph R-CNN: Towards Accurate 3D Object Detection with Semantic-Decorated Local Graph |  |  |  |  |  |  |  |  |  |  |  |  | |
| 14 | 32 | DVF-PV | 90.99 | 82.40 | 77.37 | 10 | KITTI Waymo | L+I | 开源 | the University of Toronto | 2022 arxiv |  | Dense Voxel Fusion for 3D Object Detection |  |  |  |  |  |  |  |  |  |  |  |  | |
| 15 | 36 | RDIoU | 90.65 | 82.30 | 77.26 | 33.3 | KITTI Waymo | L | 开源 | 浙江大学 | 2022 ECCV |  | Rethinking IoU-based Optimization for Single-stage 3D Object Detection |  |  |  |  |  |  |  |  |  |  |  |  | |
| 16 | 31 | Focals Conv | 90.55 | 82.28 | 77.59 | 10 | KITTI nuScenes Waymo | L、L+I | 开源 | 香港中文大学 旷视 | 2022 CVPR | Openpcdet，提出了一种新的卷积方式 |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 17 | 39 | CLOCs | 89.16 | 82.28 | 77.23 | 10 | KITTI | L+I | 开源 | 密歇根 | 2020 IROS | codebase second |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 18 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 19 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 20 |  | VOTR | 89.9 | 82.09 | 79.14 | 14.65 | KITTI Waymo | L | 开源 | 香港中文大学 | 2021 ICCV | Transformer | [ Voxel  Transformer for 3D Object Detection](http://scholar.google.de/scholar?q=Voxel%20Transformer%20for%203D%20Object%20Detection) |  |  |  |  |  |  |  |  |  |  |  |  | |
| 21 |  | EQ-PVRCNN | 90.13 | 82.01 | 77.53 | 5 | KITTI | L | 开源 | 香港中文大学 | 2022 CVPR |  | [A  Unified Query-based Paradigm for Point Cloud Understanding](http://scholar.google.de/scholar?q=A%20Unified%20Query-based%20Paradigm%20for%20Point%20Cloud%20Understanding) |  |  |  |  |  |  |  |  |  |  |  |  | |
| 22 |  | PVRCNN++ | 90.14 | 81.88 | 77.15 | 16 | KITTI | L |  | 史少帅 |  | 只有代码 |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 23 |  | PDV | 90.43 | 81.86 | 77.36 | 10 | KITTI Waymo | L | 开源 | 多伦多大学 | 2022 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 24 |  | CT3D | 87.83 | 81.77 | 77.16 | 14 | KITTI Waymo | L | 开源 | 浙江大学 阿里巴巴 | 2021 ICCV | Transformer |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 25 |  | M3DeTR | 90.28 | 81.73 | 76.96 |  | KITTI Waymo | L | 开源 | 马里兰大学 复旦大学 | 2022 WACV | Transformer |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 26 |  | SIENet | 88.22 | 81.71 | 77.22 | 12 | KITTI Waymo | L | 开源 | 东南大学自动驾驶 | 2021 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 27 |  | Voxel R-CNN | 90.9 | 81.62 | 77.06 | 25 | KITTI Waymo | L | 开源 | 中国科技大学+史少帅 | 2021 AAAI | Waymo 只做了测试集 |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 28 |  | BADet | 89.28 | 81.61 | 76.58 | 7 | KITTI nuScenes | L | 开源 | 中国人民大学 | 2022 PATTERN RECOGNITION |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 29 |  | FromVoxelToPoint | 88.53 | 81.58 | 77.37 | 10 | KITTI Waymo | L | 开源 | 浙江大学 IIAI | 2021 ACM MM |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 30 |  | H^23D R-CNN | 90.43 | 81.55 | 77.22 | 33 | KITTI Waymo | L | 开源 | 中国科技大学 | 2021 IEEE TCSVT |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 31 |  | DSA-PV-RCNN | 88.25 | 81.46 | 76.96 | 12 | KITTI | L | 开源 | 滑铁卢大学 | 2021  ICCV | baseline PVRCNN |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 32 |  | PVRCNN | 90.25 | 81.43 | 76.82 | 12 | KITTI Waymo | L | 开源 | 香港中文大学史少帅 | 2020 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |

## nuscenes

| |A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z|
|--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |---|
| 1 | 模型 | NDS | mAP | FPS | 类型 | 数据集 | 年份 | 单位 | 说明 | 论文 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 2 | BEVFusion-e | 0.761 | 0.075 |  | L+I | nuSences | 2022 arXiv | MIT |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 3 | BEVFusion | 0.729 | 0.702 | 8.4 | L+I | nuSences | 2022 arXiv |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 4 | TransFusion | 0.717 | 0.689 |  | L+I | nuSences | 2022 CVPR | 香港中文大学 | Transformer |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 5 | CenterPoint v2 | 0.714 | 0.671 |  | L+I | nuSences | 2021 CVPR | 得克萨斯大学Austin |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 6 | UVTR-Multimodality | 0.711 | 0.671 |  | L+I | nuSences | 2022 arXiv |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 7 | VISTA | 0.704 | 0.637 |  | L | nuSences | 2022 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 8 | TransFusion-L | 0.702 | 0.655 |  | L | nuSences | 2022 CVPR |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 9 | UVTR-LiDAR | 0.697 | 0.639 |  | L | nuSences | 2022 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 10 | CenterPoint-Ensemble | 0.675 | 0.611 |  | L+R | nuSences | 2020 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 11 | MEGVII | 0.633 | 0.528 |  | L | nuSences | 2019 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 12 | SSN v2 | 0.616 | 0.506 |  | L | nuSences | 2020 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 13 | RAANet | 0.583 | 0.620 | 16-22 | L | nuSences | 2021 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 14 | BEVDet4D | 0.569 | 0.451 | tiny 15 Base 1.9 | I | nuSences | 2022 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |

## FocalsConv

| |A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U|
|--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |---|
| 1 | 方法 | 说明 | R40（3D） |  |  | R40（BEV） |  |  | 开始时间 | 结束时间 | 训练时长 | epoch | epoch编号 | total_batch_size | 显卡数 | 服务器 | 复现人 |  |  |  | |
| 2 | Focals Conv | KITTI官网 | 90.55 | 82.28 | 77.59 | 92.67 | 89.00 | 86.33 |  |  |  |  |  |  |  |  |  |  |  |  | |
| 3 |  | 论文中val | 92.26 | 85.32 | 82.95 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 4 |  | 复现val（1:1划分） | 91.53 | 84.66 | 82.59 | 92.54 | 90.42 | 89.92 | 中间断了好几次 |  | 40 | 80 | 80 | 2 | 1 | 2080 | 毕江峰 |  |  |  | |
| 5 |  | 论文中test | 90.55 | 82.28 | 77.59 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | |
| 6 |  | 复现test（9:1划分） | 90.36 | 81.76 | 77.45 | 94.41 | 90.00 | 86.11 | 2022.10.19 10:00 | 2022.10.20 2:00 | 16 | 80 | 80 | 6 | 3 | 3090 | 毕江峰 |  |  |  | |


> 更新: 2023-04-26 22:01:31  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/fi3p5p/nl2g73>