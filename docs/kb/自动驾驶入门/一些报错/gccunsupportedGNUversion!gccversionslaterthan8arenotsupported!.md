# gcc  unsupported GNU version! gcc versions later than 8 are not supported!

> /usr/local/cuda/include/crt/host\_config.h:138:2: error: #error -- unsupported GNU version! gcc versions later than 8 are not supported!
>
> 138 | #error -- unsupported GNU version! gcc versions later than 8 are not supported!

问题原因：gcc版本大于9.x

分析：编译cmake需要gcc，gcc版本一般服务器会有多个不同的版本，将适合的版本用于编译即可。

解决方法（用个人用户链接到服务器上其他版本，防止更改全局版本）：

step1:

用`ls /usr/bin/gcc*`查看服务器上的其他gcc版本，如果没有合适的版本自行安装

![1658061853660-42c42d5c-2a14-49f2-8ff5-5132bb3efc1c.png](./img/Yu2eejmVYz5whrrD/1658061853660-42c42d5c-2a14-49f2-8ff5-5132bb3efc1c-968741.png)

step2:

<font style="color:rgb(77, 77, 77);">在home目录下建立bin文件夹，手动或：</font><code><font style="color:rgb(77, 77, 77);">mkdir bin</font></code>

<font style="color:rgb(77, 77, 77);">例如我需要用gcc-7</font>

<font style="color:rgb(77, 77, 77);">建立软连接：</font>`ln -s /usr/bin/gcc-7 ./bin/gcc`

查看是否建立成功<code><font style="color:rgb(77, 77, 77);">ls ./bin -l</font></code>

![1658062091337-ef7a0ad7-4209-4922-9ca2-e7ac5c98ab3f.png](./img/Yu2eejmVYz5whrrD/1658062091337-ef7a0ad7-4209-4922-9ca2-e7ac5c98ab3f-050210.png)

step3:

修改自己的系统变量

`vim ~/.bashrc`

按 i 进入输入模式

将<code><font style="color:rgb(77, 77, 77);">export PATH=$PATH:~/bin</font></code><font style="color:rgb(77, 77, 77);">加到最后一行</font>

<font style="color:rgb(77, 77, 77);">按esc 输入:wq保存退出</font>

<font style="color:rgb(77, 77, 77);">使用</font><code><font style="color:rgb(77, 77, 77);">source ~/.bashrc</font></code><font style="color:rgb(77, 77, 77);">使变量生效</font>

<font style="color:rgb(77, 77, 77);">step4:</font>

<font style="color:rgb(77, 77, 77);">查看gcc版本</font>

<code><font style="color:rgb(77, 77, 77);">gcc -v</font></code>


> 更新: 2023-05-05 14:04:28  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/rh96ge_vkrgis>