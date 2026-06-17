# 非root安装cuda（cuda版本不匹配问题）

[https://zhuanlan.zhihu.com/p/643760062](https://zhuanlan.zhihu.com/p/643760062)

重点在于修改cuda的安装目录并激活环境



（231104更）

如果服务器上有其他人装过的低版本的cuda，那么自己本地就不用装了，直接用其他人的，在bashrc里加上如下内容然后source .bashrc即可：

export CUDA_HOME=/home/songziying/cuda/cuda_11.3.0

export PATH="/home/songziying/cuda/cuda_11.3.0/bin:$PATH"

export LD_LIBRARY_PATH="/home/songziying/cuda/cuda_11.3.0/lib64:LD_LIBRARY_PATH"



这里，如果写的正确，查看nvcc的话，版本会变，但是nvidia-smi的时候cuda是高版本。



上述情况发生在服务器的cuda版本高于某位好心人已经装好的cuda版本，且另外一个人的cuda装在自己的home底下的情况。

----------------------------





> 更新: 2024-07-25 21:29:18  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/bmm8g7p2vbxo3xu6>