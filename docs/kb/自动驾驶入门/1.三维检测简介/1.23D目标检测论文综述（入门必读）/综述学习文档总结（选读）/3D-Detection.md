# 3D - Detection

| MV3D | 多模态融合方法，目的在于将具有深度优势的点云数据和具有语义优势的RGB数据进行融合，具体方法为通过3D proposal ntework提取点云俯视图（BEV），点云前视图，以及RGB图片的特征进行融合，将在BEV生成的锚框投影到另外两种视图上，利用ROI pooling获得等长特征，利用deepfusion进行融合。 |
| --- | --- |
| AVOD | 输入RGB图像以及BEV Map，利用FPN网络得到二者全分辨率的feature map，然后通过crop and resize提取两个feature map对应的feature crop并融合，最后挑选出3D proposal以实现3D物体检测。整个过程是two-stage detection，可以理解为[MV3D](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/1611.07759)的加强版,最大的改进是相比于MV3D 特征提取的VGG来说，AVOD使用的是FPN ，并且引入了encoder和decoder,保证了特征图的分辨率于输入一致。 |
| Contfuse | 首先分别在图像流和点云流(BEV)使用ResNet18提取特征，然后将图像特征进行多尺度融合并利用[PCCN](https://link.zhihu.com/?target=http%3A//openaccess.thecvf.com/content_cvpr_2018/papers/Wang_Deep_Parametric_Continuous_CVPR_2018_paper.pdf)将其“投影”到BEV map上(类似于插值过程)，融合了图像特征以及空间位置信息，最后与点云流特征进一步融合并实现3D检测。主要创新为ContFuse将image feature由前视图(FV)转换到俯视图(BEV), 然后再与点云数据对应的BEV feature进行continuous fusion, 这与之前大部分的融合方式是不同的。 |
| SCA-NET | 主要创新为将全分辨率的BEV特征图和RGB特征图均值融合，之后利用RPN生成3D候选框，再将3D候选框投影到BEV图像和RGB图像平面中并分别经过ROI Pooling层得到7×7的特征向量，利用本文提出的融合策略融合相应的特征向量并预测分类和目标框回归。融合策略为首先通过element-wise mean操作将BEV图和RGB图中的特征合并，然后将它们级联起来作为下一步的输入，这样可以使不同的视图特征之间有更多的交互. |
| RT3D | 将点云投影为3通道BEV图像：将一个grid cell的max(z), ave(z), min(z)(z为cell中点的z坐标)分别作为3-channel。利用2D RPN生成候选框。主要创新是将conv操作放到ROI pooling前面，以减少计算量，但精度下降为解决上述问题，提出了pose-sensitive map将每个ROI等分为4份，每份单独进行pooling，最后将得到的特征进行拼接 |
| IPOD | 由于F-PointNet过度依赖2D检测的结果，并且不能很好解决遮挡重叠问题因此提出IPOD，具体方法为先采用2D语义分割网络将语义信息投影到3D点云上区分前景点和背景点，使用PointNet++对每个前景点都预测一个3D proposal，然后采用NMS滤去大部分无用的proposal，同时也用PointNet++对所有点云中的每个点提取一个特征。根据已经预测的3D候选框，随机选取这个候选框里512个点的特征输入到第二阶段网络（一个小的PointNet++）预测最终的3D目标检测结果。创新点为提出了PointsIoU以及NMS中每个框的得分计算（这个框中所有3D点的得分和） |
| pointRcnn | 该方法是第一个只用输入原始点云的两阶段3d目标检测方法,方法为第一阶段直接在点云上分割mask获得前景点，在前景点的基础上生成bounding box,第二阶段对得到的proposal进行平移旋转，与一阶段的特征结合再进行分类和回归。同时提出bin-based的方法来提高网络的收敛速度，先进行分类，在每个bin下面在做res微调。 |
| pointpaintings | 作者主要认为有以下优势利用语义分割作为融合方法有这样的优势：比较容易训练，推理速度也快，语义分割输出的信息在自动驾驶任务中，不仅仅是对3D目标检测有用，对深度估计等任务也有用的。具体方法是通过转换矩阵得到image到lidar的检索信息，首先根据将image每个点得到的语义分割分数融合到lidar的表示上。 |
| STD | 结合了pointnet思想和voxel思想，主要创新点为：提出了球形anchor,保留了更多的局部上下文信息，提出了PointsPool层，该层结合了point-based 和 voxle-based方法的优点。提出了预测iou的分支来解决cls和res特征不对其的问题。 |
| F-pointnets | <font style="color:rgb(18, 18, 18);">利用现成非常成熟的2D detection技术与3D detection技术做的一个集成，是一种two-stage的late-fusion，创新在于利用image detection的frustum proposals大大减少了3D detection阶段的搜索空间，使得速度大幅提升。对于每一个2d proposal，我们可以结合depth得到3D的viewing frustum（视椎体）。在每一个frustum中通过PointNet预测物体的3D bounding box</font> |
| pointfusion | 相比于AVOD以及F-pointnets具有以下优点，第一没有使用BEV，不存在空间信息的损失，第二充分利用的RGB信息。具体创新为去除了pointnet的bn层，利用相机旋转矩阵代替T-net.提出两种fusion,分别是gobal-fusion和dense-fusion |
| RoarNet | 解决了3D投影到2D对数据标定有着极高的要求的问题。具体方法为首先<font style="color:rgb(18, 18, 18);">从图片中生成2d检测框，通过转化可以粗略生成3d regions。这一步极大的缩小了搜索范围，减少原来需要耗费很多精力的3d RPN 过程。第二部从 3d regions 回归生成最后的检测框。</font> |
| 3D IOU loss | iou loss 把所有的形状信息都考虑进了计算当中,可以隐含的编码了参数之间的关系,<font style="color:rgb(18, 18, 18);">适合解决每个参数之间的尺度和范围差异,但是没有对于针对 rotated box iou 计算。因此提出了3D IOU loss.具体方法是将box 投影到BEV视角下计算overlap,再乘以box的高度来计算3D 的IOU。IOU loss 的计算较为简单：1-iou</font> |
| <font style="color:rgb(18, 18, 18);">Fast Point R-cnn</font> | <font style="color:rgb(18, 18, 18);">快速有效的两阶段目标检测框架,该框架中，第一阶段将点云数据体素化，放入VoxelRPN中生成一个初始的预测区域，这一过程由于使用了体素化以及卷积(3D和2D结合，3D卷积先降低高度维度，再进行2D卷积)，所以会丢失一部分的定位信息。第二阶段利用re-finernet将原始点云与第一阶段生成的特征信息结合，优化第一阶段的预测结果.</font> |
| PV-RCNN | 结合sparse conv以及SA,主要创新点为<font style="color:rgb(18, 18, 18);">VSA模块以及ROI-grid Pooling模块，VSA模块就是把体素特征聚合到关键点（将pointnet++的SA应用在voxel的点云上），ROI-grid Pooling模块的作用就是利用前面提取到的多尺度关键点特征聚合得到ROI特征，将ROI均匀的划分为多个Grid与关键点进行聚合以获得更大的感受野。</font> |
| Votenet | <font style="color:rgb(18, 18, 18);">由于点云数据稀疏性，以及现有的三维激光只能获得物体表面的点云这一特性，在三维目标检测领域中，如何从稀疏且局部的点云获得目标完整的候选框，一直是较为困难的问题.votenet在输入点云上采样若干seed点并vote其所属目标的中心点，这样可以得到很多靠近该目标中心的vote点，然后在vote点上提出bounding box proposals，很好地解决了目标中心点离表面点很远时proposal不准确的缺陷.</font> |
| Imvotenet | <font style="color:rgb(18, 18, 18);">相比于votenet的改进之处在于在进行Vote之前，对 M 个点的feature进行扩充，给每个点分别添加2D图片的有用信息。点云上的每个点，都能映射（projection）到2D图片的一个像素点。因此，可以借助这种对应关系来丰富点云的feature。</font> |
| PIXOR | <font style="color:rgb(18, 18, 18);">考虑到利用3d点云直接输入计算会导致运算量过大，而投影到2D上会丢失信息。PIXOR输入3D数据进行2D卷积，具体方法为采用鸟瞰图来表示场景，将维度降为2，并且在颜色通道中保留高度信息，这样就可以在BEV表示中应用二维卷积。</font> |
| HDNET | 对于PIXOR的改进。<font style="color:rgb(18, 18, 18);">利用高精地图来做先验。还是将点云进行体素化分成3D网格，但是现有点云减去了地图中的地面高度信息，以实现将有坡度的地面拉直。同时增加了1个点云强度通道，1个来自地图中的道路区域通道。将这些通道连接在一起作为输入，做3D目标检测。</font> |
| voxelnet | <font style="color:rgb(18, 18, 18);">单阶段的基于体素的检测框架。将三维点云划分为一定数量的Voxel，经过点的随机采样以及归一化后，对每一个非空Voxel使用若干个VFE层进行局部特征提取，得到Voxel-wise Feature，然后经过3D Convolutional Middle Layers进一步抽象特征（增大感受野并学习几何空间表示），最后使用</font>[<font style="color:rgb(18, 18, 18);">RPN</font>](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/1506.01497)<font style="color:rgb(18, 18, 18);">对物体进行分类检测与位置回归。</font> |
| SECOND | <font style="color:rgb(18, 18, 18);">对于Voxelnet的改进，解决了voxelnet计算量过大的问题以及与训练过程中真实的3D检测框相反方向的预测检测框会有较大的损失函数。创新点主要为第一提出了稀疏卷积解决了运算量过大的问题，第二在最后的RPN层引入方向回归。第三提出了数据库采样的办法来进行数据增强。</font> |
| PointPillars | <font style="color:rgb(18, 18, 18);">精度与速度的均衡。主要的创新点是该方法将Point转化成一个个的Pillar（柱体），从而构成了伪图片的数据。如果每个pillar中的点云数据数据超过N 个，那么我们就随机采样至 N 个；如果每个pillar中的点云数据数据少于N 个，少于的部分我们就填充为0。生成伪图片后使用2DCNN进行特征提取。</font> |
| 3DSSD | <font style="color:rgb(18, 18, 18);">二阶段方法中的FPN以及box的微调在前向传递过程中会消耗大量时间但只利用SA又会导致精度低的问题。作者将原因归咎于最远距离采样方法几乎会过滤掉距离较远的物体的所有前景点。因此提出了一种融合空间距离与语义（特征）距离为度量的FPS采样方法，在架构中将两种采样方法得到的特征进行融合。除此之外引入了bin+res的方法来完成对转角的预测以及引入中心对齐策略</font><font style="color:#4d4d4d;background-color:#FFFFFF;">。</font> |
| SA-SSD | <font style="color:rgb(18, 18, 18);">主要创新是想要将二阶段方法独有精细回归运用在一阶段的的检测方法上（将feature 转化到point的上，得到point-wise的特征信息深度挖掘点云的几何信息），为此作者采用了SECOND作为backbone，还设计了一个auxiliary network，用于将Tensor信息转化到point上；此外在一阶段中存在预测框和clsmaps之间不匹配的问题，本文也设计了Part-sensitive warping解决这个问题。</font> |
| Frustum ConvNet | 认为是F-points的改进。创新点在于<font style="color:rgb(18, 18, 18);">视锥体级</font>[<font style="color:rgb(18, 18, 18);">特征提取</font>](https://so.csdn.net/so/search?q=%E7%89%B9%E5%BE%81%E6%8F%90%E5%8F%96&spm=1001.2101.3001.7020)<font style="color:rgb(18, 18, 18);">(将点云的逐点特征转为视锥体级特征向量以供后期网络提取特征，进而回归 3D 框，这样避免大范围遍历点云，提升了效率)以及多分辨率的视锥体的特征融合</font> |
| Patch refinement | <font style="color:rgb(18, 18, 18);">主要创新是作者使用LRN定位网络和固定的长方体anchor（patch）作用于small subject，在训练定位网络时，可以在RPN生成的框上进行随机的偏移，以达到效果。以及将定位分为两段 初步BEV定位以及3D的refine.</font> |
| Birdnet | 本文的主要创新点是密度的归一化处理，目的是解决相同场景点云密度不同时对检测有较大影响，其次是<font style="color:rgb(18, 18, 18);">通过后处理进行3D Oriented Object Detection（预测检测框的外接矩阵以及角度来来确定检测框）</font> |
| 3D FCN | 主要创新点是利用了一种新的以特征为中心的投票方式来实现的卷积层，这种新的卷积层显式利用了输入中的稀疏性 |
| MVX-net | 主要创新点是一部分通过Faster-RCNN提取RGB特征信息，另一方面通过VoxelNet提取3D点云特征（网络早期进行特征融合），提出pointfusion和voxelfusion。pointfusion将每个voxel内的点逐点与RGB特征融合。voxelfusion 则对于voxel整体特征进行融合 |
| Lasernet | 以原生的雷达数据（柱面图）作为输入，这样可以使得输入是密集规则的数据，包含5个通道（距离, 高度，方位角, 强度,以及一个标记是否包含3D点），对每个像素点预测概率分布（相对中心点在x和y方向的均值作为偏移，以及共用的方差），根据各个像素点预测结果进行聚类，产生的同一个cluster的像素点的预测结果共同决定这个cluster对应的3D。为是分布预测更简单，做了一些简化，假定所有的3D位于同一平面，且高度相同，x, y方向的方差共用。 |




> 更新: 2023-05-05 14:05:27  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/xbeg3ku3h41eq9mr_ohxg34>