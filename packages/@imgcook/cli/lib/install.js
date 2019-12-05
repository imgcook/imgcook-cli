
const chalk = require('chalk');
const fse = require('fs-extra');
const childProcess = require('child_process');
const ora = require('ora');
const path = require('path');
const { cliConfig } = require('./helper');

const spinner = ora();

const install = async (value, option) => {
  let configData = {};
  const imgcookModulesPath = cliConfig.imgcookModules;
  if (fse.existsSync(cliConfig.configFile)) {
    configData = await fse.readJson(cliConfig.configFile);
  }

  if (!fse.existsSync(`${imgcookModulesPath}`)) {
    fse.mkdirSync(`${imgcookModulesPath}`);
  }

  // 安装loader
  if (value === 'loader') {
    const loader = configData.loader;
    installLoader(loader, imgcookModulesPath);
  }

  // 安装plugin
  if (value === 'plugin') {
    const plugin = configData.plugin;
    installPackage(plugin, imgcookModulesPath);
  }

  // 安装loader和plugin
  if (value !== 'loader' && value !== 'plugin') {
    if (typeof option.name === 'function' && value === undefined) {
      const loader = configData.loader;
      installLoader(loader, imgcookModulesPath);

      const plugin = configData.plugin;
      installPackage(plugin, imgcookModulesPath);
    } else {
      installPackage(value, imgcookModulesPath);
    }
  }
};

const installLoader = (loader, dirname) => {
  if (loader && loader.length > 0) {
    try {
      // 安装loader 依赖
      for (const item of loader) {
        spinner.start(`安装 ${item} 依赖中...`);
        childProcess.exec(`npm install --prefix ${imgcookModulesPath} ${item}`, () => {
          spinner.succeed(`安装 ${item} 完成`);
        });
      }
    } catch (error) {
      spinner.fail(`安装 ${error} 失败`);
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
      childProcess.exec(`npm install --prefix ${imgcookModulesPath} ${name}`, () => {
        spinner.succeed(`安装 ${name} 完成`);
      });
    } catch (error) {
      spinner.fail(`安装 ${name} 失败`);
    }
  }
};

module.exports = (...args) => {
  return install(...args).catch(err => {
    console.log(chalk.red(err));
  });
};