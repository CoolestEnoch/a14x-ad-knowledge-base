# ssh 设置登录vscode

1.新建  .ssh文件夹

![1714107138192-8c08c92c-ad9f-4088-b246-32cddab755fd.png](./img/wZehseG8MtLhzZRO/1714107138192-8c08c92c-ad9f-4088-b246-32cddab755fd-501901.png)

2.vim authorized_keys  

![1714107330935-c37fe43f-ca17-4a09-bfe1-59888c76f010.png](./img/wZehseG8MtLhzZRO/1714107330935-c37fe43f-ca17-4a09-bfe1-59888c76f010-554393.png)

复制一下内容，一般在C盘用户下

![1714107571042-6e2c6926-8c09-451c-b2a3-82be86abdfbd.png](./img/wZehseG8MtLhzZRO/1714107571042-6e2c6926-8c09-451c-b2a3-82be86abdfbd-851658.png)

用记事本打开，复制内容到authorized_keys 中

![1714107422056-62acb3f3-b314-4b50-98b0-46ce2c4ee7ca.png](./img/wZehseG8MtLhzZRO/1714107422056-62acb3f3-b314-4b50-98b0-46ce2c4ee7ca-318512.png)



3.如果在本地电脑没有.ssh怎么办

```plain
ssh-keygen -t rsa 
```

[https://blog.csdn.net/savet/article/details/131683156](https://blog.csdn.net/savet/article/details/131683156)



> 更新: 2024-06-07 15:15:06  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/nzxlltv2r03vfhoe>