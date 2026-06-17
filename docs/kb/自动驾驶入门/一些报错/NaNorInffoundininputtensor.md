# NaN or Inf found in input tensor

* 问题原因：

原因是训练时产生了梯度爆炸

* **解决方法：**
  1. 有可能是因为作者使用的多卡训练，在所以导致学习率对于单卡来说过于大了，调小学习率
  2. 查看哪部分出了问题，对出问题部分的训练数据特征归一化处理。

例如：

`from torch.nn.functional import normalize `

`points_features[:, :3] = normalize(points_features[:, :3], dim=0) `

`points_features[:, 6:] = normalize(points_features[:, 6:], dim=0)`


> 更新: 2023-05-05 14:04:13  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/bgb928_vgbzgg>