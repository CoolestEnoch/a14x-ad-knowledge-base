# OpenPDet复现Bevfusion报错问题

正常使用openpcdet0.6.0复现bevfusion的时候，会出现**Error in collate_batch: key ******的问题，原因是numpy版本的问题。

使用以下版本numpy numba 以及SharedArray

**SharedArray               3.1.0**

**numba                        0.57.1**

**numpy                        1.22.3**



> 更新: 2023-09-07 09:22:21  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/bdmr0pmt95hby1w1>