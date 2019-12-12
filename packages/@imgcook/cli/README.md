# imgcook-cli

## 概述

imgcook-cli 可以结合 Plugin 的能力一键将 imgcook 平台生成的代码产物放置到你的本地项目工程里，无缝融合到你的研发流程，如果你有对 imgcook 生成代码的产物有加工需求（比如自动上传图片到自己的图床、文件目录转换等），imgcook-cli 是你非常好的选择。

## 安装
> imgcook-cli 安装依赖 Node.js 和 NPM，建议使用 Node.js 版本 9.x


```shell
# npm
npm install -g @imgcook/cli
# yarn
yarn global add @imgcook/cli
```

## 使用

### 常用指令

#### imgcook config
> 用户设置配置，默认初始化生成官方配置


```shell
# 设置配置
imgcook config set

# 查看配置
imgcook config ls

# 直接打开配置文件编辑
imgcook config edit
```

> DSL 配置：
> React D2C Schema：41
> Vue 开发规范：29
> 微信小程序开发规范：21
> React 开发规范：12
> H5 标准开发规范：5
> Rax 标准开发规范：1
> 
> accessId 获取：官网右上角头像 -> 个人页面 -> 左上方 Icon
> <image width="396" src="https://gw.alicdn.com/tfs/TB1rFW3qeL2gK0jSZFmXXc7iXXa-1156-480.png">


#### imgcook pull
> 拉取模块代码


```shell
# 拉取某个模块代码到本地路径
imgcook pull <moduleId> --path <path>
# 例子
imgcook pull 17108 --path mod
```

#### imgcook install
> 安装 imgcook-cli 所需的 Plugin 


```shell
# 默认安装全部配置过的 Plugin
imgcook install

# 安装指定的 Plugin
imgcook install plugin --name <value>

# 例子
imgcook install plugin --name @imgcook/plugin-images
```

### 选项


#### imgcook --version
> 显示版本信息


```shell
imgcook --version
imgcook -v
```

#### imgcook --help
> 显示指令使用帮助


```shell
imgcook --help
imgcook -h
```