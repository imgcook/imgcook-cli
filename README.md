## 介绍
imgcook-cli可以将imgcook平台模块指定dsl和选择相应插件预处理后生成并下载到本地运行。

## 安装
imgcook-cli安装依赖Nodejs和npm，建议使用Nodejs版本 9.x

```
# 外部 npm
npm install -g @imgcook/cli
# 或
yarn global add @imgcook/cli

```

## 使用
### 常用指令
#### imgcook config
> 用户设置配置，默认是官方配置

查看配置：imgcook config ls 
设置配置：imgcook config set 

```
# 显示配置如 { accessId: 'kR1ds13cJ1wT8CcJ', 'dslId': 1, uploadUrl: '', loaders: ['@imgcook/plugin-x1', '@imgcook/plugin-x2' ...]}
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
imgcook config --set <path>

# 设置配置
imgcook config set

# 设置单个配置
imgcook config --set <path> <value>
```


### imgcook pull
拉取模块代码

```
# 拉取模块代码
imgcook pull <moduleid> --path <path>
```

## 选项
### imgcook --version
> 显示版本信息

```
imgcook --version

# 快捷方式
imgcook -v

```

### imgcook --help
> 显示指令使用帮助

```
imgcook --help

# 快捷方式
imgcook -h
```



## 插件开发
> 插件分为loader和plugin两种，loader用来处理文件内容，plugin用来处理工程目录

### 插件命名规范
外部：loader： @imgcook/loader-xx  plugin: @imgcook/plugin-xx


### 插件书写规范及模版

#### loader

```
/**
 * Copyright(c) xxx Holding Limited.
 *
 * Authors: xx
 */

/**
 * @param fileValue: 文件内容，生成的代码
 * @param option: { filePath, index, config }
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

```
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