# e2d系列

# UniAD CVPR2023
![1725682247718-012b32b6-0ec1-4005-96b7-6bde1aebeca8.png](./img/JdkTy4kZcFngrPZu/1725682247718-012b32b6-0ec1-4005-96b7-6bde1aebeca8-815818.png)

任务之间的协同，而不是类似 ab c1 c2的单独任务调用或者叫co-learning

# SparseDrive
![1725692284815-a8e6cde9-02f7-42b7-8c5a-f42b987f0d68.png](./img/JdkTy4kZcFngrPZu/1725692284815-a8e6cde9-02f7-42b7-8c5a-f42b987f0d68-177100.png)

<font style="color:rgb(29, 33, 41);">Moti: BEV表征是昂贵的；以往的方法主要集中在场景学习上，采用直接的设计进行预测和规划，没有充分利用这两个任务之间的相似性，极大地限制了性能；我们消除了BEV表征，提出了对称稀疏感知，并行预测和规控。</font>

<font style="color:rgb(29, 33, 41);"></font>

<font style="color:rgb(29, 33, 41);">一段写得好Related work</font>

![1725692374379-02f3a3e1-609a-46f8-9ea3-9670578b7129.png](./img/JdkTy4kZcFngrPZu/1725692374379-02f3a3e1-609a-46f8-9ea3-9670578b7129-120993.png)

## method
### 对称感知
![1725698411227-89489515-d325-4aec-a4db-70a880e35e1b.png](./img/JdkTy4kZcFngrPZu/1725698411227-89489515-d325-4aec-a4db-70a880e35e1b-136897.png)

#### Sparse Detection. 
类似Sparse4D，有6个decoder，在第一个decoder里初始化一个anchor(类似Object Query)，将Anchor附近初始化为关键点，利用关键点投影到图像上采样，得到实例feature，不断优化这个实例feature，其他的decoder添加了时序cross-attention和一个self-attention。Anchor作为position embedding.

#### Sparse Map.
结构和检测相似 



![1725701351570-b40ae56c-1d0d-4772-b64f-06af2b38d27b.png](./img/JdkTy4kZcFngrPZu/1725701351570-b40ae56c-1d0d-4772-b64f-06af2b38d27b-387701.png)

![1725701374092-24b54d36-3095-4b70-af75-14dea7ef775c.png](./img/JdkTy4kZcFngrPZu/1725701374092-24b54d36-3095-4b70-af75-14dea7ef775c-628873.png)

# VAD
<font style="color:rgb(29, 33, 41);">moti: 以前的工作依赖于密集的栅格化场景表示(例如，代理占用和语义地图)来执行规划，这是计算密集型的，错过了实例级结构信息。</font>

<font style="color:rgb(29, 33, 41);">VAD的改进：一方面，VAD利用矢量化的代理运动和地图元素作为显式实例级规划约束，有效地提高了规划的安全性。另一方面，VAD 通过摆脱计算密集型表征和手工设计的后处理步骤，比以前的端到端规划方法快得多。</font>

<font style="color:rgb(29, 33, 41);"></font>

<font style="color:rgb(29, 33, 41);">一方面，VAD 采用地图查询和代理查询从传感器数据中</font>**<font style="color:rgb(29, 33, 41);">隐式学习</font>**<font style="color:rgb(29, 33, 41);">实例级地图特征和代理运动特征，并通过查询交互提取引导信息进行规划。另一方面，VAD 提出了基于</font>**<font style="color:rgb(29, 33, 41);">显式</font>**<font style="color:rgb(29, 33, 41);">矢量化场景表示的三个实例级规划约束：用于横向和纵向保持自我车辆与其他动态代理之间的安全距离的自我代理碰撞约束；将规划轨迹推离道路边界的自我边界超步进约束；以及自我车道方向约束，用于正则化具有矢量化车道方向的自动驾驶车辆的未来运动方向。</font>

<font style="color:rgb(29, 33, 41);"></font>

<font style="color:rgb(29, 33, 41);"></font>



> 更新: 2024-09-08 17:37:48  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/wawabo/bwc4abvie1619x06>