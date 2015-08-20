# switchHosts
hosts visual configuration

### 下载安装

npm install －g switch-hosts

---

### 命令行工具

```bash
$ switch-hosts -h

  Usage: switch-hosts [command]

  Commands:

    start                  start the switch-hosts server
    startDaemon            start with daemon
    stop                   stop the switch-hosts server
    restart                restart the switch-hosts server

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    
```

---

### 快速上手

安装成功后，使用start命令开启服务。

```bash
$ sudo switch-hosts start
```
启动完成之后可访问 `http://hosts:3003/` 访问服务配置页面。

### 注意 

linux下：可直接使用startDaemon 开启进程

windows下：使用start命令开启服务。

windows下 ctrl + c关闭进程时，进程还在，
若想关闭进程，可参考如下http://happyxiaoyue.sinaapp.com/?p=239


