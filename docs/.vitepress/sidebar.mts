export default [
      {
        text: '自动驾驶入门',
        link: '/kb/自动驾驶入门',
        collapsed: true,
        items: [
          {
            text: '1.三维检测简介',
            link: '/kb/自动驾驶入门/1.三维检测简介',
            collapsed: true,
            items: [
              {
                text: '1.1三维目标检测概念（入门必读）',
                link: '/kb/自动驾驶入门/1.三维检测简介/1.1三维目标检测概念（入门必读）',
                collapsed: true,
                items: [
                  { text: '关于anchor和 ROI pooling', link: '/kb/自动驾驶入门/1.三维检测简介/1.1三维目标检测概念（入门必读）/关于anchor和ROIpooling' },
                ],
              },
              {
                text: '1.23D目标检测论文综述（入门必读）',
                link: '/kb/自动驾驶入门/1.三维检测简介/1.23D目标检测论文综述（入门必读）',
                collapsed: true,
                items: [
                  {
                    text: '综述学习文档总结（选读）',
                    link: '/kb/自动驾驶入门/1.三维检测简介/1.23D目标检测论文综述（入门必读）/综述学习文档总结（选读）',
                    collapsed: true,
                    items: [
                      { text: '3D- Detection', link: '/kb/自动驾驶入门/1.三维检测简介/1.23D目标检测论文综述（入门必读）/综述学习文档总结（选读）/3D-Detection' },
                      { text: 'instancesegmention', link: '/kb/自动驾驶入门/1.三维检测简介/1.23D目标检测论文综述（入门必读）/综述学习文档总结（选读）/instancesegmention' },
                      { text: 'Semanticsegmentation', link: '/kb/自动驾驶入门/1.三维检测简介/1.23D目标检测论文综述（入门必读）/综述学习文档总结（选读）/Semanticsegmentation' },
                    ],
                  },
                ],
              },
              { text: '3D目标检测视频课（入门必看）', link: '/kb/自动驾驶入门/1.三维检测简介/3D目标检测视频课（入门必看）' },
            ],
          },
          {
            text: '2.数据集',
            link: '/kb/自动驾驶入门/2.数据集',
            collapsed: true,
            items: [
              { text: '2.1数据集类型概述', link: '/kb/自动驾驶入门/2.数据集/2.1数据集类型概述' },
              { text: '2.2KITTI数据集（必读）', link: '/kb/自动驾驶入门/2.数据集/2.2KITTI数据集（必读）' },
              { text: '2.3数据集评估指标（入门必读）', link: '/kb/自动驾驶入门/2.数据集/2.3数据集评估指标（入门必读）' },
              { text: '2.4nuScenes数据集（入门必读）', link: '/kb/自动驾驶入门/2.数据集/2.4nuScenes数据集（入门必读）' },
              { text: '2.5Waymo数据集', link: '/kb/自动驾驶入门/2.数据集/2.5Waymo数据集' },
              { text: '2.6数据集相关链接', link: '/kb/自动驾驶入门/2.数据集/2.6数据集相关链接' },
            ],
          },
          {
            text: '3.三维检测经典文献',
            link: '/kb/自动驾驶入门/3.三维检测经典文献',
            collapsed: true,
            items: [
              { text: '3.1必读论文（入门必读）', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.1必读论文（入门必读）' },
              { text: '3.2Point-Based 论文（入门必读）', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.2Point-Based论文（入门必读）' },
              { text: '3.3Voxel-Based 论文（入门必读）', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.3Voxel-Based论文（入门必读）' },
              { text: '3.4Point-Voxel-Based 论文（入门必读）', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.4Point-Voxel-Based论文（入门必读）' },
              {
                text: '3.5图像和点云融合（入门必读）',
                link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）',
                collapsed: true,
                items: [
                  {
                    text: '3.5.0综述',
                    link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.0综述',
                    collapsed: true,
                    items: [
                      { text: 'Multi-modalSensor Fusion for Auto Driving Perception_ A Survey', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.0综述/Multi-modalSensorFusionforAutoDrivingPerception_ASurvey' },
                      { text: 'DeepMulti-modal Object Detection and Semantic Segmentation for Autonomous Driving_ Datasets, Methods, and Challenges', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.0综述/DeepMulti-modalObjectDetectionandSemanticSegmentationforAutonomousDriving_Datasets,Methods,andChallenges' },
                    ],
                  },
                  {
                    text: '3.5.1 前期融合',
                    link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.1前期融合',
                    collapsed: true,
                    items: [
                      { text: '6.AGeneralPipeline', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.1前期融合/6.AGeneralPipeline' },
                      { text: '1.Frustum-PointNets', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.1前期融合/1.Frustum-PointNets' },
                      { text: '2.Frustum-PointPillars', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.1前期融合/2.Frustum-PointPillars' },
                      { text: '3.Complexer-YOLO', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.1前期融合/3.Complexer-YOLO' },
                      { text: '4.PointPainting', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.1前期融合/4.PointPainting' },
                      { text: '5.FusionPainting', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.1前期融合/5.FusionPainting' },
                      { text: '6.AGeneral Pipeline', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.1前期融合/6.AGeneralPipeline' },
                    ],
                  },
                  {
                    text: '3.5.2中间融合',
                    link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合',
                    collapsed: true,
                    items: [
                      { text: 'Voxel', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/Voxel' },
                      { text: 'AutoAlign', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/AutoAlign' },
                      { text: 'FUTR3D', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/FUTR3D' },
                      { text: 'Cross-modality', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/Cross-modality' },
                      { text: 'EPNet', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/EPNet' },
                      { text: 'PI-RCNN', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/PI-RCNN' },
                      { text: 'PointAugmenting', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/PointAugmenting' },
                      { text: 'TransFusion', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/TransFusion' },
                      { text: 'BEVFusion', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/BEVFusion' },
                      { text: 'CAT-Det', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/CAT-Det' },
                      { text: 'Deepfusion', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/Deepfusion' },
                      { text: 'PointFusion', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/PointFusion' },
                      { text: '3D-CVF', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/3D-CVF' },
                      { text: 'MMF', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/MMF' },
                      { text: 'ContFuse', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/ContFuse' },
                      { text: 'AVOD', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/AVOD' },
                      { text: 'MV3D', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.2中间融合/MV3D' },
                    ],
                  },
                  {
                    text: '3.5.3后期融合',
                    link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.3后期融合',
                    collapsed: true,
                    items: [
                      { text: 'CLOCs', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.3后期融合/CLOCs' },
                      { text: 'Fast-CLOCs', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.5图像和点云融合（入门必读）/3.5.3后期融合/Fast-CLOCs' },
                    ],
                  },
                ],
              },
              { text: '3.6BEV入门探索（入门必读）', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.6BEV入门探索（入门必读）' },
              {
                text: '3.7.Graph for 3D OD',
                link: '/kb/自动驾驶入门/3.三维检测经典文献/3.7.Graphfor3DOD',
                collapsed: true,
                items: [
                  { text: '时间脉络梳理', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.7.Graphfor3DOD/时间脉络梳理' },
                  { text: '方法调研表格', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.7.Graphfor3DOD/方法调研表格' },
                  { text: '时间脉络梳理', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.7.Graphfor3DOD/时间脉络梳理' },
                ],
              },
              { text: '3.8.持续学习for 3D OD', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.8.持续学习for3DOD' },
              { text: '3.9融合相关文章总结（xmind文件）', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.9融合相关文章总结（xmind文件）' },
              { text: '3.10多模态 3D 目标检测（顶会和顶刊）', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.10多模态3D目标检测（顶会和顶刊）' },
              { text: '3.11协同感知', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.11协同感知' },
              { text: '3.123D检测Baseline', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.123D检测Baseline' },
              { text: '3.133D目标检测入门常用资料_博客知乎github等', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.133D目标检测入门常用资料_博客知乎github等' },
              { text: '3.14长尾 & 难检_漏检_远距离 for 3D OD', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.14长尾&难检_漏检_远距离for3DOD' },
              { text: '3.15diffusion for 3D&e2e【张根瑞】', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.15diffusionfor3D&e2e【张根瑞】' },
              {
                text: '3.16毫米波 for 3D检测 代鑫光',
                link: '/kb/自动驾驶入门/3.三维检测经典文献/3.16毫米波for3D检测代鑫光',
                collapsed: true,
                items: [
                  { text: '3.16.1毫米波雷达信号处理基础', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.16毫米波for3D检测代鑫光/3.16.1毫米波雷达信号处理基础' },
                  {
                    text: '3.16.2Radar传统边缘方案',
                    link: '/kb/自动驾驶入门/3.三维检测经典文献/3.16毫米波for3D检测代鑫光/3.16.2Radar传统边缘方案',
                    collapsed: true,
                    items: [
                      { text: '3.16.2.1', link: '/kb/自动驾驶入门/3.三维检测经典文献/3.16毫米波for3D检测代鑫光/3.16.2Radar传统边缘方案/3.16.2.1' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            text: '4.端到端',
            collapsed: true,
            items: [
              {
                text: '4.1必看论文',
                link: '/kb/自动驾驶入门/4.端到端/4.1必看论文',
                collapsed: true,
                items: [
                  { text: '端到端自动驾驶入门', link: '/kb/自动驾驶入门/4.端到端/4.1必看论文/端到端自动驾驶入门' },
                ],
              },
              { text: '4.2数据集', link: '/kb/自动驾驶入门/4.端到端/4.2数据集' },
              { text: '4.3SparseDrive（端到端）', link: '/kb/自动驾驶入门/4.端到端/4.3SparseDrive（端到端）' },
              { text: '4.4SparseDrive复现过程中的问题', link: '/kb/自动驾驶入门/4.端到端/4.4SparseDrive复现过程中的问题' },
              { text: '4.5FusionAD 复现过程存在的问题', link: '/kb/自动驾驶入门/4.端到端/4.5FusionAD复现过程存在的问题' },
              { text: '4.6UniAD和FusionAD添加对齐噪声', link: '/kb/自动驾驶入门/4.端到端/4.6UniAD和FusionAD添加对齐噪声' },
              { text: '4.7UniAD看数据 日志', link: '/kb/自动驾驶入门/4.端到端/4.7UniAD看数据日志' },
              { text: '4.8ego坐标系 坐标转换', link: '/kb/自动驾驶入门/4.端到端/4.8ego坐标系坐标转换' },
              {
                text: '4.9MomAD可视化',
                link: '/kb/自动驾驶入门/4.端到端/4.9MomAD可视化',
                collapsed: true,
                items: [
                  { text: '转弯场景可视化', link: '/kb/自动驾驶入门/4.端到端/4.9MomAD可视化/转弯场景可视化' },
                  { text: '预测轨迹可视化', link: '/kb/自动驾驶入门/4.端到端/4.9MomAD可视化/预测轨迹可视化' },
                  { text: '预测轨迹可视化（调整样式）', link: '/kb/自动驾驶入门/4.端到端/4.9MomAD可视化/预测轨迹可视化（调整样式）' },
                  { text: '预测轨迹可视化(调整为发散状态)', link: '/kb/自动驾驶入门/4.端到端/4.9MomAD可视化/预测轨迹可视化(调整为发散状态)' },
                  { text: '多时刻轨迹同时可视化', link: '/kb/自动驾驶入门/4.端到端/4.9MomAD可视化/多时刻轨迹同时可视化' },
                ],
              },
              {
                text: '4.10闭环端到端（bench2drive）',
                link: '/kb/自动驾驶入门/4.端到端/4.10闭环端到端（bench2drive）',
                collapsed: true,
                items: [
                  { text: 'Bench2drive代码结构解析', link: '/kb/自动驾驶入门/4.端到端/4.10闭环端到端（bench2drive）/Bench2drive代码结构解析' },
                  { text: '闭环论文梳理', link: '/kb/自动驾驶入门/4.端到端/4.10闭环端到端（bench2drive）/闭环论文梳理' },
                  { text: '闭环评价体系', link: '/kb/自动驾驶入门/4.端到端/4.10闭环端到端（bench2drive）/闭环评价体系' },
                  { text: 'BaseLine复现', link: '/kb/自动驾驶入门/4.端到端/4.10闭环端到端（bench2drive）/BaseLine复现' },
                ],
              },
              { text: '4.11SparseDriveb2d 闭环测试', link: '/kb/自动驾驶入门/4.端到端/4.11SparseDriveb2d闭环测试' },
              { text: '4.12碰撞鲁棒数据集复现', link: '/kb/自动驾驶入门/4.端到端/4.12碰撞鲁棒数据集复现' },
              {
                text: '4.13前沿论文阅读',
                link: '/kb/自动驾驶入门/4.端到端/4.13前沿论文阅读',
                collapsed: true,
                items: [
                  { text: '01Devil is in Narrow Policy_ Unleashing Exploration in Driving VLA Models', link: '/kb/自动驾驶入门/4.端到端/4.13前沿论文阅读/01DevilisinNarrowPolicy_UnleashingExplorationinDrivingVLAModels' },
                  { text: '02DynVLA_ Learning World Dynamics for Action Reasoning in Autonomous Driving', link: '/kb/自动驾驶入门/4.端到端/4.13前沿论文阅读/02DynVLA_LearningWorldDynamicsforActionReasoninginAutonomousDriving' },
                  { text: '03GenieDrive_ Towards Physics-Aware Driving World Model with 4D Occupancy Guided Video Generatio', link: '/kb/自动驾驶入门/4.端到端/4.13前沿论文阅读/03GenieDrive_TowardsPhysics-AwareDrivingWorldModelwith4DOccupancyGuidedVideoGeneratio' },
                  { text: '04OccTENS_ 3D Occupancy World Model via Temporal Next-Scale Prediction', link: '/kb/自动驾驶入门/4.端到端/4.13前沿论文阅读/04OccTENS_3DOccupancyWorldModelviaTemporalNext-ScalePrediction' },
                  { text: '05COME_ Adding Scene-Centric Forecasting Control to Occupancy World Model', link: '/kb/自动驾驶入门/4.端到端/4.13前沿论文阅读/05COME_AddingScene-CentricForecastingControltoOccupancyWorldModel' },
                  { text: '06WALL-E_ WORLD ALIGNMENT BY RULE LEARNING IMPROVES WORLD MODEL-BASED LLM', link: '/kb/自动驾驶入门/4.端到端/4.13前沿论文阅读/06WALL-E_WORLDALIGNMENTBYRULELEARNINGIMPROVESWORLDMODEL-BASEDLLM' },
                  { text: '07DriveDreamer4D_ World Models Are Effective Data Machines for 4D Driving Scene Representation', link: '/kb/自动驾驶入门/4.端到端/4.13前沿论文阅读/07DriveDreamer4D_WorldModelsAreEffectiveDataMachinesfor4DDrivingSceneRepresentation' },
                ],
              },
            ],
          },
          {
            text: '5.世界模型',
            collapsed: true,
            items: [
              { text: '5.1世界模型 in 自动驾驶', link: '/kb/自动驾驶入门/5.世界模型/5.1世界模型in自动驾驶' },
              { text: '5.2面向具身智能的视频生成模型微调与配置方法', link: '/kb/自动驾驶入门/5.世界模型/5.2面向具身智能的视频生成模型微调与配置方法' },
            ],
          },
          {
            text: '6.越野自动驾驶',
            link: '/kb/自动驾驶入门/6.越野自动驾驶',
            collapsed: true,
            items: [
              { text: '1.相关文章（论文名称，团队，发表期刊和会议，年份，开源链接）', link: '/kb/自动驾驶入门/6.越野自动驾驶/1.相关文章（论文名称，团队，发表期刊和会议，年份，开源链接）' },
              { text: '2.已经复现的文章', link: '/kb/自动驾驶入门/6.越野自动驾驶/2.已经复现的文章' },
            ],
          },
          {
            text: '7.论文复现及服务器使用',
            collapsed: true,
            items: [
              { text: '7.0OpenPCDet框架学习', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.0OpenPCDet框架学习' },
              { text: '7.13090服务器环境配置', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.13090服务器环境配置' },
              { text: '7.2框架安装配置', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.2框架安装配置' },
              { text: '7.3框架结构分析', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.3框架结构分析' },
              { text: '7.4数据集配置与训练测试（训练前必看）', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.4数据集配置与训练测试（训练前必看）' },
              {
                text: '7.5论文实验部分细节（数据集划分KITTI）',
                link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.5论文实验部分细节（数据集划分KITTI）',
                collapsed: true,
                items: [
                  { text: 'nuScenes子集划分及使用', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.5论文实验部分细节（数据集划分KITTI）/nuScenes子集划分及使用' },
                  { text: '数据集划分参考', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.5论文实验部分细节（数据集划分KITTI）/数据集划分参考' },
                  { text: '数据集不同比例的划分(KITTI、nuScenes等)', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.5论文实验部分细节（数据集划分KITTI）/数据集不同比例的划分(KITTI、nuScenes等)' },
                ],
              },
              { text: '7.6PointPillars复现', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.6PointPillars复现' },
              { text: '7.7在验证集上测试', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.7在验证集上测试' },
              { text: '7.8Docker的使用', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.8Docker的使用' },
              {
                text: '7.9BEVFusion复现',
                link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.9BEVFusion复现',
                collapsed: true,
                items: [
                  { text: 'GraphBEV（通过Graph来更精确深度）', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.9BEVFusion复现/GraphBEV（通过Graph来更精确深度）' },
                  { text: '如何能加spatial_alignment_noise', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.9BEVFusion复现/如何能加spatial_alignment_noise' },
                  { text: 'BEVFusion复现-daixinguang', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.9BEVFusion复现/BEVFusion复现-daixinguang' },
                  { text: 'OpenPDet复现Bevfusion报错问题', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.9BEVFusion复现/OpenPDet复现Bevfusion报错问题' },
                ],
              },
              { text: '7.10Focalsconv论文 spconv_plus配置流程', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.10Focalsconv论文spconv_plus配置流程' },
              {
                text: '5.11SAMfor多模态3DOD抗噪算法',
                collapsed: true,
                items: [
                  { text: 'Transfusion（SAM融合，小波相关模块）实现人：刘林', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/5.11SAMfor多模态3DOD抗噪算法/Transfusion（SAM融合，小波相关模块）实现人：刘林' },
                  { text: 'Focals-conv-mm(SAM融合，小波模块，点云特征图像特征fusion模块)实现人：张国欣&刘林', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/5.11SAMfor多模态3DOD抗噪算法/Focals-conv-mm(SAM融合，小波模块，点云特征图像特征fusion模块)实现人：张国欣&刘林' },
                  { text: '3D_Corruptions_AD，KITTI-C，nus-C，实现人：鑫光', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/5.11SAMfor多模态3DOD抗噪算法/3D_Corruptions_AD，KITTI-C，nus-C，实现人：鑫光' },
                ],
              },
              { text: '7.12SparseDet实现代码', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.12SparseDet实现代码' },
              { text: '7.13VoxelNextFusion（TGRS2023） 如何实现patch融合', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.13VoxelNextFusion（TGRS2023）如何实现patch融合' },
              { text: '7.14RI-fusion模块介绍', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.14RI-fusion模块介绍' },
              { text: '7.15新手入门：复现MomAD的流程和遇到的一些问题', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.15新手入门：复现MomAD的流程和遇到的一些问题' },
              { text: '7.16transfusion复现过程问题', link: '/kb/自动驾驶入门/7.论文复现及服务器使用/7.16transfusion复现过程问题' },
            ],
          },
          {
            text: '一些报错',
            link: '/kb/自动驾驶入门/一些报错',
            collapsed: true,
            items: [
              { text: 'cannotimportname\'CUDAEvent\'from\'cumm.core_cc.tensorview_bind\'(unknownlocation)', link: '/kb/自动驾驶入门/一些报错/cannotimportname\'CUDAEvent\'from\'cumm.core_cc.tensorview_bind\'(unknownlocation)' },
              { text: '编译后还出现nomodulenamed\'pcdet\'', link: '/kb/自动驾驶入门/一些报错/编译后还出现nomodulenamed\'pcdet\'' },
              { text: '安装torch_scatter报错 ATen_OpMathType.h：No such file or director', link: '/kb/自动驾驶入门/一些报错/安装torch_scatter报错ATen_OpMathType.h：Nosuchfileordirector' },
              { text: 'crypt.h：Nosuch file or directory 亲测（openpcdet 编译问题）', link: '/kb/自动驾驶入门/一些报错/crypt.h：Nosuchfileordirectory亲测（openpcdet编译问题）' },
              { text: 'Segmentfault (core dump)', link: '/kb/自动驾驶入门/一些报错/Segmentfault(coredump)' },
              { text: 'cannotimport name \'CUDAEvent\' from\'cumm.core_cc.tensorview_bind\' (unknown location)', link: '/kb/自动驾驶入门/一些报错/cannotimportname\'CUDAEvent\'from\'cumm.core_cc.tensorview_bind\'(unknownlocation)' },
              { text: 'Logonet复现过程中的报错', link: '/kb/自动驾驶入门/一些报错/Logonet复现过程中的报错' },
              { text: '非root安装cuda（cuda版本不匹配问题）', link: '/kb/自动驾驶入门/一些报错/非root安装cuda（cuda版本不匹配问题）' },
              { text: 'gcc unsupported GNU version! gcc versions later than 8 are not supported!', link: '/kb/自动驾驶入门/一些报错/gccunsupportedGNUversion!gccversionslaterthan8arenotsupported!' },
              { text: '关于nohub&的使用', link: '/kb/自动驾驶入门/一些报错/关于nohub&的使用' },
              { text: 'Spconv1.2在30系显卡上的问题', link: '/kb/自动驾驶入门/一些报错/Spconv1.2在30系显卡上的问题' },
              { text: 'NaNor Inf found in input tensor', link: '/kb/自动驾驶入门/一些报错/NaNorInffoundininputtensor' },
              { text: '编译后还出现nomodule named \'pcdet\'', link: '/kb/自动驾驶入门/一些报错/编译后还出现nomodulenamed\'pcdet\'' },
              { text: 'EOFError_marshal data too short', link: '/kb/自动驾驶入门/一些报错/EOFError_marshaldatatooshort' },
            ],
          },
          {
            text: '工具类',
            link: '/kb/自动驾驶入门/工具类',
            collapsed: true,
            items: [
              { text: 'TCSVTDGFusion投稿流程相关 by JFY', link: '/kb/自动驾驶入门/工具类/TCSVTDGFusion投稿流程相关byJFY' },
              { text: '参考文献bib去掉去重代码', link: '/kb/自动驾驶入门/工具类/参考文献bib去掉去重代码' },
              { text: '验证nuscenes不同像素可见度', link: '/kb/自动驾驶入门/工具类/验证nuscenes不同像素可见度' },
              { text: 'OpenPCDet中的gt_sample数据增强', link: '/kb/自动驾驶入门/工具类/OpenPCDet中的gt_sample数据增强' },
              { text: '北交服务器上网', link: '/kb/自动驾驶入门/工具类/北交服务器上网' },
              { text: 'ssh设置登录vscode', link: '/kb/自动驾驶入门/工具类/ssh设置登录vscode' },
              { text: 'mmdet3dnuscenes数据集生成及一些坑', link: '/kb/自动驾驶入门/工具类/mmdet3dnuscenes数据集生成及一些坑' },
              { text: 'GPT4VAPI调用demo（给图实现描述）', link: '/kb/自动驾驶入门/工具类/GPT4VAPI调用demo（给图实现描述）' },
              { text: 'coverletter template from TCSVT by szy', link: '/kb/自动驾驶入门/工具类/coverlettertemplatefromTCSVTbyszy' },
              { text: 'Open3d可视私有点云数据集（合众汽车数据集）', link: '/kb/自动驾驶入门/工具类/Open3d可视私有点云数据集（合众汽车数据集）' },
              { text: '商汤多机多卡使用（目前只能训练不能eval）', link: '/kb/自动驾驶入门/工具类/商汤多机多卡使用（目前只能训练不能eval）' },
              { text: '0.6.0版本mmdet3dnuScenes数据集划分', link: '/kb/自动驾驶入门/工具类/0.6.0版本mmdet3dnuScenes数据集划分' },
              { text: 'bypy（百度网盘和linux服务器上传下载）', link: '/kb/自动驾驶入门/工具类/bypy（百度网盘和linux服务器上传下载）' },
              { text: '如何计算模型的参数量（下面是FPS）', link: '/kb/自动驾驶入门/工具类/如何计算模型的参数量（下面是FPS）' },
              { text: '验证模型在不同距离段的表现', link: '/kb/自动驾驶入门/工具类/验证模型在不同距离段的表现' },
              { text: '可视化工具kitti_object_vis（服务器没有显示器，使用本地电脑）', link: '/kb/自动驾驶入门/工具类/可视化工具kitti_object_vis（服务器没有显示器，使用本地电脑）' },
              {
                text: 'python制作柱状图 折线图',
                link: '/kb/自动驾驶入门/工具类/python制作柱状图折线图',
                collapsed: true,
                items: [
                  { text: 'KITTI数据集去掉背景点可视化（服务器没有显示器，使用本地电脑）', link: '/kb/自动驾驶入门/工具类/python制作柱状图折线图/KITTI数据集去掉背景点可视化（服务器没有显示器，使用本地电脑）' },
                  { text: 'KITTI上 “easy”，“mod.”,_hard_数量分布', link: '/kb/自动驾驶入门/工具类/python制作柱状图折线图/KITTI上“easy”，“mod.”,_hard_数量分布' },
                  { text: '一组数据的高斯曲线绘制', link: '/kb/自动驾驶入门/工具类/python制作柱状图折线图/一组数据的高斯曲线绘制' },
                  { text: 'GraphBEV++折线图', link: '/kb/自动驾驶入门/工具类/python制作柱状图折线图/GraphBEV++折线图' },
                  { text: '杨磊车路协同数据集类别统计', link: '/kb/自动驾驶入门/工具类/python制作柱状图折线图/杨磊车路协同数据集类别统计' },
                  { text: '可视化柱状对比精度图副本', link: '/kb/自动驾驶入门/工具类/python制作柱状图折线图/可视化柱状对比精度图副本' },
                ],
              },
            ],
          },
        ],
      },
      {
        text: '现有工作',
        link: '/kb/现有工作',
        collapsed: true,
        items: [
          {
            text: 'MambaAD？相关实验与报告',
            link: '/kb/现有工作/MambaAD？相关实验与报告',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '自动驾驶e2e鲁棒性实验',
            link: '/kb/现有工作/自动驾驶e2e鲁棒性实验',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'FusionAD相关实验',
            link: '/kb/现有工作/FusionAD相关实验',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'SparseDrive相关实验',
            link: '/kb/现有工作/SparseDrive相关实验',
            collapsed: true,
            items: [
              { text: 'MomAD(SparseDrive)闭环', link: '/kb/现有工作/SparseDrive相关实验/MomAD(SparseDrive)闭环' },
              { text: 'MomAD(VAD)闭环', link: '/kb/现有工作/SparseDrive相关实验/MomAD(VAD)闭环' },
              { text: 'MomAD(SparseDrive)', link: '/kb/现有工作/SparseDrive相关实验/MomAD(SparseDrive)' },
            ],
          },
          {
            text: 'MIT-BevfusionNus实验结果',
            link: '/kb/现有工作/MIT-BevfusionNus实验结果',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'MonoHeight',
            link: '/kb/现有工作/MonoHeight',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'UniTR',
            link: '/kb/现有工作/UniTR',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '2DPASS结果',
            link: '/kb/现有工作/2DPASS结果',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'FocalsconvSam',
            link: '/kb/现有工作/FocalsconvSam',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '3D_Corruptions_AD复现结果',
            link: '/kb/现有工作/3D_Corruptions_AD复现结果',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'nuScenes实验',
            link: '/kb/现有工作/nuScenes实验',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'VoxelNeXt_SparseDet',
            link: '/kb/现有工作/VoxelNeXt_SparseDet',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'VoxelFusion',
            link: '/kb/现有工作/VoxelFusion',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'FocalsConv-nuScenes',
            link: '/kb/现有工作/FocalsConv-nuScenes',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'RIFusion',
            link: '/kb/现有工作/RIFusion',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'Waymo实验',
            link: '/kb/现有工作/Waymo实验',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'KITTI新论文复现结果',
            link: '/kb/现有工作/KITTI新论文复现结果',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '实验结果汇总表',
            link: '/kb/现有工作/实验结果汇总表',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '融合方法baseline',
            link: '/kb/现有工作/融合方法baseline',
            collapsed: true,
            items: [
            ],
          },
        ],
      },
      {
        text: '实用技术',
        link: '/kb/实用技术',
        collapsed: true,
        items: [
          {
            text: 'Lerobot本地部署+远程部署',
            link: '/kb/实用技术/Lerobot本地部署+远程部署',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'python代码效率优化',
            link: '/kb/实用技术/python代码效率优化',
            collapsed: true,
            items: [
            ],
          },
        ],
      },
      {
        text: '学习笔记',
        link: '/kb/学习笔记',
        collapsed: true,
        items: [
          {
            text: 'e2d系列',
            link: '/kb/学习笔记/e2d系列',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '图卷积学习',
            link: '/kb/学习笔记/图卷积学习',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '车路综述调研',
            link: '/kb/学习笔记/车路综述调研',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '全稀疏',
            link: '/kb/学习笔记/全稀疏',
            collapsed: true,
            items: [
            ],
          },
        ],
      },
      {
        text: '二维入门相关',
        link: '/kb/二维入门相关',
        collapsed: true,
        items: [
          {
            text: 'DETR系列',
            collapsed: true,
            items: [
              { text: 'DETR', link: '/kb/二维入门相关/DETR系列/DETR' },
              { text: 'DCN& Deformable DETR', link: '/kb/二维入门相关/DETR系列/DCN&DeformableDETR' },
            ],
          },
          {
            text: 'YOLO',
            link: '/kb/二维入门相关/YOLO',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '1.基础知识与PyTorch基础',
            link: '/kb/二维入门相关/1.基础知识与PyTorch基础',
            collapsed: true,
            items: [
              { text: '1.1物体检测基础知识', link: '/kb/二维入门相关/1.基础知识与PyTorch基础/1.1物体检测基础知识' },
              { text: '1.2PyTorch基础', link: '/kb/二维入门相关/1.基础知识与PyTorch基础/1.2PyTorch基础' },
            ],
          },
          {
            text: '2.网络骨架：Backbone',
            link: '/kb/二维入门相关/2.网络骨架：Backbone',
            collapsed: true,
            items: [
              { text: '2.1神经网络基本组成', link: '/kb/二维入门相关/2.网络骨架：Backbone/2.1神经网络基本组成' },
              { text: '2.2经典的网络Backbone', link: '/kb/二维入门相关/2.网络骨架：Backbone/2.2经典的网络Backbone' },
            ],
          },
          {
            text: '3.两阶经典检测器：FasterRCNN',
            link: '/kb/二维入门相关/3.两阶经典检测器：FasterRCNN',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '4.单阶多层检测器：SSD',
            link: '/kb/二维入门相关/4.单阶多层检测器：SSD',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '5.单阶段经典检测器YOLO',
            link: '/kb/二维入门相关/5.单阶段经典检测器YOLO',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '6.模型加速之轻量化网络',
            link: '/kb/二维入门相关/6.模型加速之轻量化网络',
            collapsed: true,
            items: [
              { text: '6.1压缩再扩展SqueezeNet', link: '/kb/二维入门相关/6.模型加速之轻量化网络/6.1压缩再扩展SqueezeNet' },
              { text: '6.2深度可分离MobileNet', link: '/kb/二维入门相关/6.模型加速之轻量化网络/6.2深度可分离MobileNet' },
              { text: '6.3通道混洗ShuffleNet', link: '/kb/二维入门相关/6.模型加速之轻量化网络/6.3通道混洗ShuffleNet' },
            ],
          },
          {
            text: '7.物体检测细节处理',
            link: '/kb/二维入门相关/7.物体检测细节处理',
            collapsed: true,
            items: [
              { text: '7.2样本不均衡问题', link: '/kb/二维入门相关/7.物体检测细节处理/7.2样本不均衡问题' },
              { text: '7.1NMS 非极大值抑制', link: '/kb/二维入门相关/7.物体检测细节处理/7.1NMS非极大值抑制' },
              { text: '7.2样本不均衡问题', link: '/kb/二维入门相关/7.物体检测细节处理/7.2样本不均衡问题' },
              { text: '7.3模型过拟合', link: '/kb/二维入门相关/7.物体检测细节处理/7.3模型过拟合' },
            ],
          },
          {
            text: '8.难点与展望',
            link: '/kb/二维入门相关/8.难点与展望',
            collapsed: true,
            items: [
              {
                text: '8.1难点',
                link: '/kb/二维入门相关/8.难点与展望/8.1难点',
                collapsed: true,
                items: [
                  { text: '8.1.1多尺度检测', link: '/kb/二维入门相关/8.难点与展望/8.1难点/8.1.1多尺度检测' },
                  { text: '8.1.2拥挤与遮挡', link: '/kb/二维入门相关/8.难点与展望/8.1难点/8.1.2拥挤与遮挡' },
                ],
              },
              {
                text: '8.2展望',
                link: '/kb/二维入门相关/8.难点与展望/8.2展望',
                collapsed: true,
                items: [
                  { text: '8.2.1重新思考物体检测', link: '/kb/二维入门相关/8.难点与展望/8.2展望/8.2.1重新思考物体检测' },
                  { text: '8.2.2摆脱锚框   Anchor-Free', link: '/kb/二维入门相关/8.难点与展望/8.2展望/8.2.2摆脱锚框Anchor-Free' },
                ],
              },
            ],
          },
        ],
      },
      {
        text: '项目资源',
        link: '/kb/项目资源',
        collapsed: true,
        items: [
          {
            text: 'ICCV2023 3DOD',
            link: '/kb/项目资源/ICCV20233DOD',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '顶会-频域',
            link: '/kb/项目资源/顶会-频域',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '会议论文整理2022',
            link: '/kb/项目资源/会议论文整理2022',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'Oral2022论文整理',
            link: '/kb/项目资源/Oral2022论文整理',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'ECCV2022论文',
            link: '/kb/项目资源/ECCV2022论文',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'NeurIPS2022--AcceptPaper List',
            link: '/kb/项目资源/NeurIPS2022--AcceptPaperList',
            collapsed: true,
            items: [
            ],
          },
        ],
      },
      {
        text: '文章调研',
        link: '/kb/文章调研',
        collapsed: true,
        items: [
          {
            text: 'VFF流程图',
            link: '/kb/文章调研/VFF流程图',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'VFF流程图',
            link: '/kb/文章调研/VFF流程图',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '2022_9_5',
            link: '/kb/文章调研/2022_9_5',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'VoxelField Fusion for 3D Object Detection',
            link: '/kb/文章调研/VoxelFieldFusionfor3DObjectDetection',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '无标题文档',
            link: '/kb/文章调研/无标题文档',
            collapsed: true,
            items: [
            ],
          },
        ],
      },
      {
        text: '3D检测相关Baseline',
        link: '/kb/3D检测相关Baseline',
        collapsed: true,
        items: [
          {
            text: 'fuseBaseline',
            link: '/kb/3D检测相关Baseline/fuseBaseline',
            collapsed: true,
            items: [
            ],
          },
          {
            text: '说明',
            link: '/kb/3D检测相关Baseline/说明',
            collapsed: true,
            items: [
            ],
          },
          {
            text: 'Baseline',
            link: '/kb/3D检测相关Baseline/Baseline',
            collapsed: true,
            items: [
            ],
          },
        ],
      },
      {
        text: 'learning',
        collapsed: true,
        items: [
          { text: 'ChatGPT-IDM损失解释', link: '/kb/learning/ChatGPT-IDM损失解释' },
        ],
      },
      {
        text: '未分类',
        collapsed: true,
        items: [
          { text: 'CVPR2026', link: '/kb/CVPR2026' },
        ],
      },
]

