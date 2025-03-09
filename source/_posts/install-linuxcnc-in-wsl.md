---
title: WSL 编译 linuxcnc (Debian / Ubuntu)
date: 2024-03-14 21:36:23
tags: [linuxcnc, wsl, 数控]
---

# WSL 编译 linuxcnc (Debian / Ubuntu)

验证下来 Debian 和 Ubuntu 都可以使用 (未开启实时补丁的情况下，会在非实时环境运行), 但是 GUI 部分，Ubuntu 和 WSL 的集成度更高。

**如果只是简单的使用和调试，个人推荐使用 Ubuntu**

## **操作步骤**

1. 开启 WSL
   
    控制面板 - 程序和功能 - 启用或关闭 Windows 功能 - 适用于 Linux 的 Windows 子系统
    
    在 Windows 11 中，默认就是 WSL2, 所以下文都是基于 WSL2 的
    
    记得在 Powershell 中先更新下 wsl
    
    ```powershell
    wsl --update
    wsl --shutdown
    ```
    
2. 安装 debian 或者 Ubuntu
   
    在 microsoft store 里下载和安装 debian 或者 Ubuntu
    
3. 换源
   
    **Ubuntu 可以不用换，默认源速度也还可以**
    
    debian 默认使用的是欧洲的一个 CDN, 所以速度特别慢，直接换下镜像源
    
    修改方法：
    
    `sudo vi /etc/apt/sources.list`
    
    将内容修改为
    
    ```
    deb http://mirror.nju.edu.cn/debian bookworm main
    deb http://mirror.nju.edu.cn/debian bookworm-updates main
    deb http://mirror.nju.edu.cn/debian-security bookworm-security main
    deb http://mirror.nju.edu.cn/debian bookworm-backports main
    ```
    
    > [Tips]
    > 
    > 
    > debian 里的 vi 是个不完整的，所以输入上下之类的会有 ^B 这种转义符，
    > 
    > 所以可以考虑直接 dd 全删了，然后 i 再复制上去，:wq 保存
    > 
    
    source 下，或者直接重启下 debian 生效
    
4. 获取 linuxcnc 的源码和编译
   
    ```
    sudo apt-get update
    sudo apt-get install git
    sudo apt-get install python3
    sudo apt-get install python3-gi
    sudo apt-get install python3-gi-cairo
    sudo apt-get install python3-pip
    
    git clone https://github.com/LinuxCNC/linuxcnc.git linuxcnc-dev
    cd linuxcnc-dev
    ./debian/configure
    sudo apt-get build-dep .
    
    cd src
    ./autogen.sh
    ./configure --with-realtime=uspace
    make
    sudo make setuid
    ```
    
    如果网络顺畅，整个过程大概在 20~30 分钟
    
    > [Tips]
    > 
    > 
    > 如果网络不顺畅，比如从 github 拉源码一直失败，可以考虑挂代理
    > 
    > 以 Clash for windows 为例，
    > 
    > 1. 在 windows 本机开启 Allow Lan
    > 2. 在 debian 使用 `cat /etc/resolv.conf` 查看 dns
    > 3. 在 debian 设置代理
    > 
    > `export ALL_PROXY="http://172.24.176.1:7890"`
    > 
5. 运行 linuxcnc
   
    安装 python 界面库的依赖
    
    ```
    [Debian] pip install pyopengl --break-system-packages
    [Ubuntu] pip install pyopengl
    ```
    
    启动 linux cnc
    
    ```
    source ../scripts/rip-environment
    linuxcnc
    ```
    
    这个时候就会启动带界面的 linuxcnc
    

![linux_cnc](http://raw.githubusercontent.com/lusipad/imgur/main/img/image.png)
    

**对于 Ubuntu, 已经可以正常使用了.**

**但是 Debian, 会出现界面花屏的情况.**

### **使用 XLanuch (仅针对 Debian)**

1. 在 windows 下载和安装 [Release 21.1.10 · marchaesen/vcxsrv (github.com)](https://github.com/marchaesen/vcxsrv/releases/tag/21.1.10)
2. 开启 XLaunch



1. 在 debian 启动 linuxcnc
   
    `linuxcnc`
    
    就会弹出 linuxcnc 的 GUI 界面
    

## **参考资料**

1. [Building LinuxCNC](https://linuxcnc.org/docs/html/code/building-linuxcnc.html)