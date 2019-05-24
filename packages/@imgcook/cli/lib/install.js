
const chalk = require('chalk');
const fse = require('fs-extra');
const childProcess = require('child_process');
const ora = require('ora');
const path = require('path');
const { cliConfig } = require('./helper');

const spinner = ora();

const install = async (value, option) => {
  let configData = {};
  if (fse.existsSync(cliConfig.configFile)) {
    configData = await fse.readJson(cliConfig.configFile);
  }
  const dirname = path.join(__dirname, '../');

  if (option.name) {
    installPackage(option.name, dirname);
    return;
  }

  // 安装loader
  if (value === 'loader') {
    const loaders = configData.loaders;
    installLoader(loaders, dirname);
  }

  // 安装plugin
  if (value === 'plugin') {
    const plugin = configData.plugin;
    installPackage(plugin, dirname);
  }

  // 安装loader和plugin
  if (value !== 'loader' && value !== 'plugin' && typeof option.name === 'function') {
    const loaders = configData.loaders;
    installLoader(loaders, dirname);

    const plugins = configData.plugins;
    installPackage(plugins, dirname);
  }
};

const installLoader = (loaders, dirname) => {
  if (loaders && loaders.length > 0) {
    try {
      // 安装loader 依赖
      for (const item of loaders) {
        spinner.start(`安装 ${item} 依赖中...`);
        childProcess.execSync(`cd ${dirname} && npm install ${item}`);
        spinner.succeed(`安装 ${item} 完成...`);
      }
    } catch (error) {
      spinner.fail(`安装 ${error} 失败。`);
    }
  }
};

const installPackage = (name, dirname) => {
  if (!name) {
    return;
  }
  if (name !== '') {
    try {
      spinner.start(`安装 ${name} 依赖中...`);
      childProcess.execSync(`cd ${dirname} && npm install ${name}`);
      spinner.succeed(`安装 ${name} 完成...`);
    } catch (error) {
      spinner.fail(`安装 ${name} 失败。`);
    }
  }
};

module.exports = (...args) => {
  return install(...args).catch(err => {
    console.log(chalk.red(err));
  });
};