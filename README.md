## 介绍
imgcook-cli 可以将 imgcook 平台生成的代码产物（template + style）一键放到本地任意项目目录中，无缝融合到您的研发流程；如果需要加工产物（如：自动上传图片到自己的图片空间、文件目录转化等），均可以自定义插件完成自定义加工。

## 安装
> imgcook-cli安装依赖 Nodejs 和npm，建议使用Nodejs版本 9.x

```shell
# npm
npm install -g @imgcook/cli
# 或
yarn global add @imgcook/cli

```

演示效果：<br/> <img src="https://img.alicdn.com/tfs/TB1s8TOU7voK1RjSZFwXXciCFXa-1627-1176.gif" width="500" />

## 使用
### 常用指令
#### imgcook config
> 用户设置配置，默认是官方配置


查看配置：`imgcook config ls` <br />设置配置：`imgcook config set` 
```shell
 
# 显示配置如 { accessId: 'kR1ds13cJ1wT8CcJ', 'dslId': 1, loaders: ["@imgcook/cli-loader-images" ...], "plugins": "@imgcook/cli-plugin-generate", uploadUrl: '',}
#
# 各模版对应的id
# Vue 开发规范: 29, 
# 微信小程序开发规范: 21, 
# React 开发规范: 12, 
# H5 标准开发规范: 5, 
# Rax 标准开发规范: 1

# 查看配置
imgcook config

# 查看单个配置
imgcook config --get <path>

# 直接打开配置文件编辑
imgcook config edit
# 插件安装
imgcook install
imgcook install loader
imgcook install plugin
imgcook install plugin --name <value>

# 设置配置
imgcook config set

# 设置单个配置
imgcook config --set <path> <value>
# 例子
imgcook config --set loaders @imgcook/cli-loader-images

# 移除loaders里插件
imgcook config --remove <path> <value>
# 例子
imgcook config --remove loaders @imgcook/cli-loader-images

```
注：<br/> 1. Access ID 可以在 https://imgcook.taobao.org 上点击头像 》用户信息 查看
<img src="https://img.alicdn.com/tfs/TB1rK6HU4YaK1RjSZFnXXa80pXa-1122-568.png" width="561" /><br/> 2. dslId 表示 DSL(Domain Specific Language) id，可以在[dsl列表页](https://imgcook.taobao.org/dsl)上hover到更新时间上查看如图:<img src="https://img.alicdn.com/tfs/TB1injJXxiH3KVjSZPfXXXBiVXa-528-424.png" width="200" /> <br/>3. loaders 表示加载预处理文件插件列表，可以添加自定义的loader <br/> 4. plugins 表示对整个文件操作插件<br/> 5. uploadUrl 表示上传接口，需要和`@imgcook/cli-loader-images`一起使用, 可通过 `imgcook config --set <path> <value>` 配置


#### imgcook pull
> 拉取模块代码

```shell
# 拉取模块代码
imgcook pull <moduleid> --path <path>
```
注：<br/> 1. moduleid 表示模块 ID，打开模块详情在URL上参数查看如图<br/><img src="https://img.alicdn.com/tfs/TB1wtzsVCzqK1RjSZPxXXc4tVXa-1138-508.png" width="400" /><br/>2. path 表示下载到的文件夹名称

#### imgcook install
> 安装依赖loader和插件

```shell
# 默认安装全部
imgcook install

# 安装全部loader
imgcook install loader

# 安装全部plugin
imgcook install plugin

# 安装某个插件(包括loader插件)
imgcook install plugin --name <value>

# 例子
imgcook install plugin --name @imgcook/cli-loader-images
```

### 选项

#### imgcook --version
> 显示版本信息

```shell
imgcook --version

# 快捷方式
imgcook -v
```

#### imgcook --help
> 显示指令使用帮助

```shell
imgcook --help

# 快捷方式
imgcook -h
```


## 插件开发
> 插件分为loader和plugin两种，loader用来处理文件内容，plugin用来处理工程目录

### 插件命名规范
loader： `@imgcook/loader-xx`  plugin: `@imgcook/plugin-xx` <br />

### 插件规范

#### loader
示例：[https://github.com/imgcook/imgcook-cli/tree/master/packages/%40imgcook/cli-loader-images](https://github.com/imgcook/imgcook-cli/tree/master/packages/%40imgcook/cli-loader-images)
```javascript
/**
 * Copyright(c) xxx Holding Limited.
 *
 * Authors: xx
 */

/**
 * @param fileValue: 文件内容，生成的代码
 * @param option: { item, filePath, index, config }
 */
const loaderExample = async (fileValue, option) => {
  return fileValue;
}

module.exports = (...args) => {
  return loaderExample(...args).catch(err => {
    console.log(err);
  });
};
```

#### plugin
示例：[https://github.com/imgcook/imgcook-cli/tree/master/packages/%40imgcook/cli-plugin-generate](https://github.com/imgcook/imgcook-cli/tree/master/packages/%40imgcook/cli-plugin-generate)
```javascript

/**
 * Copyright(c) xxx Holding Limited.
 *
 * Authors: xx
 */

/**
 * @param fileValue: 文件内容，生成的代码
 * @param option: { filePath, index, config }
 */
const pluginExample = async (fileValue, option) => {
  const filePaths = {}
  return filePaths;
}

module.exports = (...args) => {
  return pluginExample(...args).catch(err => {
    console.log(err);
  });
};
```