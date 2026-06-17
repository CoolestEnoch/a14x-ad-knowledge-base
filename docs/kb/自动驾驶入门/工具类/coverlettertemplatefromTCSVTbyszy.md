# cover letter template from TCSVT by szy

一个cover letter的参考模板。



Ziying Song  
Beijing Jiaotong University  
No.3 Shang Yuan Village, Xizhimen Wai, Haidian District, Beijing  
Beijing, China  
(+86) 18395622998  
[22110110@bjtu.edu.cn](mailto:22110110@bjtu.edu.cn)



Dr. Feng Wu  
Editor-in-Chief  
IEEE Transactions on Circuits and Systems for Video Technology



22-June-2023



Dear Prof. Wu



We sincerely thank you for your time and efforts in handling and reviewing our manuscript, entitled " GraphAlign++: An Accurate Feature Alignment by Graph Matching for Multi-Modal 3D Object Detection" (ID: TCSVT-13200-2023). We first showcased the success of graph-based multi-modal fusion in 3D object detection, addressing the issue of misaligned features in real-world scenarios. After carefully considering all the comments received, we have revised the manuscript accordingly. In the following section, we elaborate on two issues, Article Revision and Cite.



1. Article revision  
After the first TCSVT submission, we worked non-stop on further experiments and continued to think and improve in order to make a huge upgrade in just one month after receiving the review comments. In fact, we have been working on it for two months. We agree with the reviewer's commnets and have adequately addressed their major concerns, including limited novelty, inferior performance, unconvincing ablation studies, unfair comparisons, technical description and writing issues, etc. Our view is consistent with the reviewer, and we reorganize the logic of the article, modify the unreasonable parts, and enrich the experiments, including:  
According to Reviewer 1,  
	Firstly, we have added an analysis of two attention-based mechanisms, CenterFormer and AutoAlignV2, in the related work section, particularly comparing the differences in methods and highlighting the similarity between AutoAlignV2 and our GraphAlign++ in addressing feature alignment issues.  
	Secondly, to address the issue of runtimes mentioned in the paper, we conducted tests using using a V100 GPU and 2080Ti GPU in the same environment to provide updated runtime.  
	In the initial submission, due to limitations in the nuScenes official server for uploads, we were only able to submit twice, which prevented us from selecting the best results. However, with our data augmentation and hyperparameter tuning, our current evaluation metrics have significantly improved. We have also compared the performance with state-of-the-art algorithms such as Focals Conv-F, VFF, UVTR, BEVFusion, TransFusion, VoxelNext, and AutoAlignV2. In particular, we compared the runtime and AP with AutoAlignV2 and Focals Conv-F on the 1/8 nuScenes validation set, achieving excellent speed and accuracy performance.  
	Finally, we have diligently corrected errors in the paper, such as spelling mistakes and certain descriptive errors.  
According to Reviewer 2, we sincerely appreciate the acceptance. Furthermore, we have added a reference to the related work VFF.  
According to Reviewer 3,  
	Firstly, we have added an analysis of the three algorithms suggested by the reviewer, namely Cont fuse, Boosting3D, and AutoAlignV2, to determine the novelty of our module.  
	Secondly, we have addressed the issue of unfair runtime comparisons resulting from different testing environments by conducting tests on both V100 and 2080Ti GPU.  
	Furthermore, we have emphasized the subspace partitioning method in the paper. Additionally, we have simplified the abstract and corrected some writing errors.  
	Lastly, we have provided the AP for pedestrians and cyclists on the KITTI test dataset.
2. Cite  
In addition, we have cited five recent articles published in your esteemed journal that are highly relevant to the field of 3D object detection for autonomous driving, and share many similarities with our work in downstream tasks. Additionally, in the experimental section, we have conducted algorithm performance comparisons with three of these articles.  
A.	Gao, Y. Pang, J. Nie, Z. Shao, J. Cao, Y. Guo, and X. Li, “Esgn: Efficient stereo geometry network for fast 3d object detection,” IEEE Transactions on Circuits and Systems for Video Technology, 2022.  
(Compared to ref. A, although we perform the same 3D object detection task, ref. A relies solely on image-based detection while we use multimodal fusion (combining both Lidar point clouds and images) for 3D object detection.)  
B.	Tao, J. Cao, C. Wang, Z. Zhang, and Z. Gao, “Pseudo-mono for monocular 3d object detection in autonomous driving,” IEEE Transactions on Circuits and Systems for Video Technology, 2023.  
(Compared to ref. B, which uses the same 3D object detection technology, ref. B is a pseudo-monocular 3D object detection, while our GraphAlign++ is a multi-modal fusion system that combines Lidar point cloud and image data for 3D object detection.)  
C.	W. Xiao, Y. Peng, C. Liu, J. Gao, Y. Wu, and X. Li, “Balanced sample assignment and objective for single-model multi-class 3d object detection,” IEEE Transactions on Circuits and Systems for Video Technology,2023.  
(Ref. C(BSAODet) and GraphAlign++ are both tools for 3D object detection. However, the difference between them lies in that ref. C(BSAODet) is based on a single LiDAR point cloud and focuses on addressing imbalanced sample quality and target classification. On the other hand, GraphAlign++ primarily addresses feature alignment in multi-modal 3D object detection.)  
D.	J. Deng, W. Zhou, Y. Zhang, and H. Li, “From multi-view to hollow-3d:Hallucinated hollow-3d r-cnn for 3d object detection,” IEEE Transactions on Circuits and Systems for Video Technology, vol. 31, no. 12, pp.4722–4734, 2021.  
(Ref. D is a single-modality Lidar 3D object detection task that primarily addresses the issue of point cloud sparsity by regarding point clouds as hollow-3D data. On the other hand, our GraphAlign++ is a 3D object detection method that fuses images and Lidar point clouds, aiming to solve the problem of feature alignment.)  
E.	X. Tian, M. Yang, Q. Yu, J. Yong, and D. Xu, “Medoidsformer: A strong 3d object detection backbone by exploiting interaction with adjacent medoid tokens,” IEEE Transactions on Circuits and Systems for Video Technology, 2023.  
(Ref. E is also a single-modality Lidar point cloud 3D object detection method, mainly designed to address the problem of sparsity in point clouds. It utilizes Self-Attention to focus on the interaction within the surrounding regions. On the other hand, our GraphAlign++ is a multi-modal 3D object detection framework designed to solve the feature alignment problem. Although both methods are aimed at 3D object detection, they differ in terms of the problems addressed and their solutions.)  
F.	Yang L, Zhang X, Li J, et al. Mix-teaching: A simple, unified and effective semi-supervised learning framework for monocular 3d object detection[J]. IEEE Transactions on Circuits and Systems for Video Technology, 2023.  
(Ref. F proposed a monocular 3D object detection method and introduced a simple, unified, and effective semi-supervised learning framework. Meanwhile, our GraphAlign++focuses on multi-modal fusion (combining LiDAR point cloud and images) to address the issue of cross-modal feature misalignment.)



All authors have read the manuscript and are approved to submit it to your journal.  
Thank you very much for your attention and consideration.



Sincerely yours,  
Ziying Song





# 不公平审稿，发EIC
Thank you very much for your team's tremendous effort. However, in the previous version titled "VoxelFusion: A Simple, Unified and Effective Voxel Fusion Framework for Multi-Modal 3D Object Detection" with ID TGRS-2023-03188, the paper was immediately rejected without entering the external review process, citing the reason as "not aligned with the direction of TGRS journal." We believe this is an unfair treatment because there have been several papers in the same domain published in TGRS that have caused a significant impact in the community. Additionally, we are addressing some issues specifically related to Lidar, which falls within the scope covered by your esteemed journal. Overall, being rejected without entering the external review process is unfair.



> 更新: 2023-12-12 18:08:39  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/hcceuk47fu869qvq>