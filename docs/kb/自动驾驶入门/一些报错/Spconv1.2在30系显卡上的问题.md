# Spconv1.2在30系显卡上的问题

很多论文放的代码用的是Spconv1.2 也就是OpenPCDet的老版本(v0.3.0及以下)

在30系显卡上进行安装容易出问题，即使安装上了跑起来了也容易出现问题（猜测是因为30系只能使用cuda11.x的原因）

（20系推荐使用VoxelRCNN的docker）

主要思路：安装Spconv2.x来强行跑通，避开使用Spconv1.2



# 两种解决方法
## 1 让代码兼容Spconv2.1 避开Spconv1.2
（参考SFD调试 [博客](https://zhuanlan.zhihu.com/p/524097054?) [issues](https://github.com/LittlePey/SFD/issues/2)）

对于OpenPCDet框架来说可以把关于Spconv的部分迁移到新版本上，让代码兼容Spconv2.x



参考[OpenPCDet SpConv v2 改动](https://github.com/open-mmlab/OpenPCDet/commit/70857b83ca8689732af9c1e1efc84c99041ac467#diff-8b89e36729dafcd09f0360508559e5fd8577f7ee48c6097c4efb8ad12757fa5b) 复制相应的**修改和新增部分**就行（这是OpenPCDet迭代到0.4.0部分的改动）

注意，看清楚原来的模型是否在相应的py文件上面有改动 如果没有就可以通篇复制

（如果不清楚的话就一行一行复制）

修改完之后就兼容Spconv2.x了

如果有需要自己手动修改相应的部分



## 2 找一个兼容Spconv2.x的OpenPCDet去修改为自己想要的模型
主要思路是：把论文放的OpenPCDet代码修改的部分移植到可以运行的OpenPCDet中

这个方法比较繁琐 还是推荐使用第一种



> 更新: 2023-05-05 14:04:01  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/taueww_mf91kh>