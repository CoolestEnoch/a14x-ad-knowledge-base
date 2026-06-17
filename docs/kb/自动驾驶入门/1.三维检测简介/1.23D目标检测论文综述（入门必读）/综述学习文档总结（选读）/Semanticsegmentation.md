# Semantic segmentation

| Deepr3ss | 使用2D-CNNS代替3D-CNNS，使用点云渲染生成结构化的2D图像，利用深度，rgb,点云2D图像分别输入2D-fully-convolutional-network中，最后将每个点的得分进行叠加，最后映射回3D空间上。 |
| --- | --- |
| snapnet | 依旧使用类似Deepr3ss的方法，区别在于只使用RGB和深度图像（包含多个视角下的深度图像）输入到fully-convolutional-network中，最后将得分叠加映射回原空间 |
| SqueezeSeg | 将3D点云经过球面投影得到前视图，之后利用Squeezenet 进行特征提取以及分割最后利用CRF（Conditional Random Field)作为RNN层对分割结果进一步优化 |
| SqueezeSegV2 | 相比于V1，网络结构中插入了CAM来提高模型的聚合能力，同时提出了焦点损失来解决背景点数量和前景点数量不均衡的问题，最大的创新是提出学习强度渲染（网络预测强度），测地线对齐，渐进域校准使得利用合成数据的模型也可以迁移到实际场景中<font style="color:rgb(79, 79, 79);">。</font> |
| RangeNet++ | 主要创新是点云分割的后处理方式：KNN-search用于解决边缘点出错的问题,思路是<font style="color:rgb(18, 18, 18);">通过每个点的一些邻居点的类别来判定目标点的类别。</font> |
| RSnet | 主要创新是提出了slice pooling layer,将输入的原始点云进行切片从而获得有序的特征序列，此外将双向RNN应用到网络中获得收到周边点影响的特征，最后映射回每个点 |
| SEGcloud | 被体素化并通过3D全卷积神经网络馈送，以生成粗略的下采样体素标签。三线性插值层将此粗略输出从体素转换回原始3D点表示。获得的3D点分数用于在3D全连接CRF中进行推理以产生最终结果 |
| FCPN | 第一个采用全卷积直接处理原始数据的网络结构,首先使用Abstraction layers进行空间上和概念上的划分，之后使用feature learner(1*1,3*3)来增加特征的多尺度(在对应阶段的deconv后连接)最后用Weighted Average Pooling来捕捉距离cell不同距离的特征权重。 |
| sparseConvnet | 为了解决传统卷积在3D网络中出现的子流形问题，作者提出了新的卷积操作“submanifold sparse convolution（SSC）”，提出了两种稀疏卷积SC和VSC两种一起使用因为VSC没有办法扩大感受野。 |
| SPLATNet | (没读懂)通过控制点云相应的lattice特征的尺度（如lattice特征取为点云的空间坐标），利用BCL 实现不同分辨率下的点云特征提取，类似经典CNN中的层级特征提取。<br/>利用splat 和 slice操作，实现特征（或信号）在2D（图像空间），3D空间（lattice空间）的嵌入转换，从而直观地融合2D图像特征和3D点云特征，进行multi-task 学习。 |
| LatticeNet | 引入了称为DeformsSlice的与数据相关的插值模块，以将晶格特征反投影到点云. |
| 3DMV | 主要创新是相比于之前工作将特征简单的投影到Voxel上，作者<font style="color:rgb(0, 0, 0);">引入了一个可微的反投影层，将2D特征映射到3D网格上。然后通过网络的3D卷积部分将这些投影特征与3D几何信息合并(利用3Dconv先卷积再合并)</font> |
| MVPNet | 主要创新是提出了视图选择模块(用最少的RGB图像尽量覆盖最多的点云)以及2D-3D fusion模块（主要是dense向sparse的转变利用MLP将几个点的特征整合为一个特征投影到点云上） |
| UPB | 从点云中学习2D纹理外观、3D结构和全局上下文特征。该方法直接应用基于点的网络从稀疏采样的点集中提取局部几何特征和全局上下文，而不需要任何体素化 |
| pointsift | 参考了sift的思想，提出了pointsift模块可以衔接到任何point-based的框架里，创新点是pointsift可以自适应的调整尺度以及对各个方向的编码能力提高了特征表达能力 |
| G+RCU | <font style="color:rgb(0, 0, 0);">提出以一种自适应的方式定义邻域，使用两种不同的分组机制来定义点云上的邻域:特征空间邻域(mlp连接邻域内点的特征)以及世界空间坐标系邻域（kmeans聚类同一邻域内所有点连接平均值特征）</font> |
| pointWeb | <font style="color:rgb(0, 0, 0);">提出了自适应特征调整AFA模块(考虑区域内相邻点之间的区域特征),来学习每个点对其他点的影响，以调整其特征。该方法将邻域上下文引入点特征中，增强了特征对局部邻域的描述能力.</font> |
| Shellnet | <font style="color:rgb(0, 0, 0);">提出了一种可以用于直接处理3D空间中的</font>[<font style="color:rgb(0, 0, 0);">点云</font>](https://so.csdn.net/so/search?q=%E7%82%B9%E4%BA%91&spm=1001.2101.3001.7020)<font style="color:rgb(0, 0, 0);">数据的卷积算子ShellConv并基于此设计了一个ShellNet，可以用于分类以及点云的语义分割。该方法首先查询一组多尺度同心球，然后在不同壳层内使用max-pooling操作汇总统计信息，使用mlp和1D卷积得到最终的卷积输出。</font> |
| <font style="color:rgb(0, 0, 0);">Randla-net</font> | <font style="color:rgb(0, 0, 0);">RandLA-Net采用的是RS采样方式,同时为了解决信息丢失的问题提出了LFA，主要聚合局部的特征(第一部分相当于point++的KNN方法，之后利用SE自注意机制加权特征，最后残差连接)</font> |
| PAT | 舍弃掉了pointnet++中利用卷积核来提取局部特征的方式，换成了类似自注意力机制的方式（GSA）来获得点间的关联信息（突出一些点的特征），另外舍弃掉了pointnet++中使用最远点采样（FPS）的方式来获取代表点的方法，改为使用Gumbel Subset Sampling来获取代表点 |
| Darnet | 解决连接区域特征不明显的问题，提出了可以无缝衔接到任何语义分割框架的ASR模块，具体方法为利用max pooling 计算出邻域的临界点分数，同时利用自身点的语义分割分数和临界点分数进行加权整合。 |
| Point-cnn | 提出了pointwise-conv(中心点附近的区域分成栅格，每个栅格内的特征先相加然后用密度归一化，最后再乘以栅格内的卷积权重得到一个栅格的特征，多个栅格的特征相加得到新的特征),同时去除了pool层 |
| <font style="color:rgb(0, 0, 0);">PCCN</font> | <font style="color:rgb(0, 0, 0);">提出了一种基于参数连续卷积层的PCCN网络。该层的核函数由mlp参数化，论文里说相比于离散卷积分配权重，这里利用mlp去逼近连续的核函数。</font> |
| KPconv | <font style="color:rgb(0, 0, 0);">KPConv受基于图像的卷积的启发，但是代替核像素，使用一组kernel points 来定义每个kernel weight 的应用区域,其定义范围可以在点云的不同位置变化，而且内核点数不受约束。</font> |
| SpiderCNN | <font style="color:rgb(0, 0, 0);">将其kernel 定义为多项式函数族，并对每个neighbor应用不同的权重。 应用于neighbor的权重取决于neighbor的距离顺序，从而使过滤器在空间上不一致</font> |
| Flex-convolution | <font style="color:rgb(0, 0, 0);">使用线性函数对其内核进行建模</font> |
| Rsnet | <font style="color:rgb(0, 0, 0);">网络由三部分组成：slice pooling layer, RNN layers, and a slice unpooling layer。slice pooling layer 将无序的点云特征映射为有序的特征向量序列，以便可以应用传统的端到端学习算法.</font> |
| Dar-net | <font style="color:rgb(0, 0, 0);">DAR-Net的核心思想是生成一个自适应的pooling skeleton，这个结构既考虑了场景的复杂结构也结合了局部几何特征。skeleton提供可变的半局部感受野和权重，成为了连接局部卷积</font>[<font style="color:rgb(0, 0, 0);">特征提取</font>](https://so.csdn.net/so/search?q=%E7%89%B9%E5%BE%81%E6%8F%90%E5%8F%96&spm=1001.2101.3001.7020)<font style="color:rgb(0, 0, 0);">器和全局循环特征聚合器的桥梁.相当于提取除了全局点云的Keypoint</font> |
| 3DCNN-DQN-RNN | <font style="color:rgb(0, 0, 0);">首先使用3D CNN网络学习空间分布和颜色特征，DQN进一步用于定位属于特定类的对象。最后将拼接后的特征向量输入残差RNN，得到最终分割结果.</font> |
| SPG | <font style="color:rgb(0, 0, 0);">当时的研究更多的使用3维投影到2维的图像上，因此会丢失掉部分点云的信息，作者将点云看作简单形状（超级点）内在联系的集合，这种可以用有向图来表示。几何同质分割：将点云分割为简单但富有意义的几何形状。Superpoint嵌入进行降采样方便利用pointnet做分割</font> |
| SSP | <font style="color:rgb(0, 0, 0);">将点云超分割为纯超点。将问题转变为为一个由邻接图构成的深度度量学习问题。此外，还提出了一种图结构的对比损失，以帮助识别物体之间的边界。</font> |
| PyramNet | <font style="color:rgb(0, 0, 0);">提出了一种基于图嵌入模块(GEM)和金字塔注意力网络(PAN)的金字塔网。GEM模块将点云表示为有向无环图，并利用协方差矩阵代替欧几里得距离来构造相邻相似矩阵。PAN模块使用四种不同大小的卷积核来提取不同语义强度的特征。</font> |
| DGCNN | <font style="color:rgb(0, 0, 0);">提出了图注意卷积(GAC)来选择性地从局部邻近集学习相关特征，通过根据不同相邻点和特征通道的空间位置和特征差异，动态分配注意权重来实现的。</font> |
| pointGcR | <font style="color:rgb(0, 0, 0);">使用无向图表示沿通道维度捕获全局上下文信息。PointGCR是一个即插即用的端到端可训练模块。它可以很容易地集成到现有的细分网络中，以实现性能的提高</font> |




> 更新: 2023-05-05 14:05:13  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/mls6mp3oc13n6fc7_dcnt78>