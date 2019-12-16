const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const spinner = ora();
const cwd = process.cwd();

const {
  ajaxPost,
  getPlugin,
  cliConfig,
  installPluginSync
} = require('./helper');

const pull = async (value, option) => {
  let filePath = cwd;
  if (option.path) {
    filePath = path.isAbsolute(option.path)
      ? option.path
      : path.join(cwd, option.path);
  }

  if (!fs.existsSync(cliConfig.configFile)) {
    console.log('请先设置配置，执行`imgcook config set`');
    const inquirer = require('inquirer');
    inquirer
      .prompt({
        type: 'confirm',
        message: '是否开始设置？',
        name: 'set'
      })
      .then(async answers => {
        if (answers.set) {
          require('./config')('set', {});
        }
      });
    return;
  }
  const url = cliConfig.module.url;
  const imgcookModulesPath = cliConfig.imgcookModules;

  let configData = fs.readFileSync(cliConfig.configFile, 'UTF-8');
  configData = JSON.parse(configData);

  const repoData = await ajaxPost(url, {
    data: {
      dsl_id: configData.dslId,
      access_id: configData.accessId,
      mod_id: value
    }
  });

  if (repoData.data) {
    let data = repoData.data;
    const moduleData = data.moduleData;
    let errorData;
    moduleData && spinner.start(`「${moduleData.name}」模块下载中...`);
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }

    try {
      // execute plugin
      let plugin = configData.plugin || [];

      // 拉取配置
      // const pluginData = await getPlugin({
      //   config: configData,
      //   id: value,
      //   type: 'module'
      // });
      // if (pluginData && pluginData.plugin && pluginData.plugin.length > 0) {
      //   plugin = pluginData.plugin;
      //   await installPluginSync(plugin, imgcookModulesPath);
      // }

      if (plugin.length > 0) {
        for (const pluginItem of plugin) {
          const pluginItemPath = `${imgcookModulesPath}/node_modules/${pluginItem}`;
          data = await require(pluginItemPath)({
            data,
            filePath,
            config: configData,
            cmd: {
              value,
              ...option
            }
          });
        }
      }
    } catch (error) {
      errorData = error;
    }

    // delete images/.imgrc
    const imgrcPath = `${filePath}/images/.imgrc`;
    if (fs.existsSync(imgrcPath)) {
      fs.unlinkSync(imgrcPath);
    }
    let isSuccess = true;

    if (!errorData) {
      if (!data.errorList || data.errorList.length === 0) {
        isSuccess = true;
      } else {
        isSuccess = false;
      }
    } else {
      isSuccess = false;
    }

    if (!moduleData && repoData.errorMsg) {
      spinner.fail(repoData.errorMsg);
      return;
    }

    if (isSuccess) {
      spinner.succeed(`「${moduleData.name}」下载完成`);
    } else {
      spinner.fail(`「${moduleData.name}」下载失败`);
      errorData && console.error(errorData);
      data.errorList && console.error(data.errorList);
    }
  }

  if (!repoData.success) {
    if (repoData.code && repoData.code.message) {
      console.log(chalk.red(`Error: ${repoData.code.message}`));
    } else {
      console.log(chalk.red(`Error: ${JSON.stringify(repoData)}`));
    }
  }
};

module.exports = (...args) => {
  return pull(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
