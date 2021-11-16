const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const spinner = ora();
const cwd = process.cwd();
const logger = require('./logger');

const {
  ajaxPost,
  getPlugin,
  cliConfig
  // installPluginSync
} = require('./helper');

const pull = async (value, option) => {
  let filePath = cwd;
  option.path = option.path || value;
  filePath = path.isAbsolute(option.path)
    ? option.path
    : path.join(cwd, option.path);

  if (!fs.existsSync(cliConfig.configFile)) {
    console.log(
      'Please set the configuration first，Execute `imgcook config set`'
    );
    const inquirer = require('inquirer');
    inquirer
      .prompt({
        type: 'confirm',
        message: 'Whether to start setting？',
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
  if (repoData.data && repoData.data.code) {
    let data = repoData.data;

    // fs.writeFile(
    //   `${filePath}/demo.json`,
    //   JSON.stringify(data, null, 2),
    //   'utf8',
    //   () => {}
    // );
    const moduleData = data.moduleData;
    let errorData;
    if (!moduleData) {
      return spinner.fail(`failed to parse module data, moduleData not found.`);
    }
    if (option.output === 'json') {
      process.stdout.write(moduleData.jsonv2);
      return;
    }
    spinner.start(`「${moduleData.name}」Downloading module...`);

    try {
      // execute plugin
      let plugin = configData.plugin || [];

      // 拉取配置
      const pluginData = await getPlugin({
        config: configData,
        id: value,
        type: 'module'
      });
      // if (pluginData && pluginData.plugin && pluginData.plugin.length > 0) {
      //   plugin = pluginData.plugin;
      //   let needInstallPlugin = [];
      //   try {
      //     const files = fs.readdirSync(`${imgcookModulesPath}/node_modules/@imgcook`);
      //     for (const item of plugin) {
      //       if (files.indexOf(item.split('/')[1]) === -1) {
      //         needInstallPlugin.push(item);
      //       }
      //     }
      //   } catch (error) {
      //     needInstallPlugin = plugin;
      //   }
      //   if (needInstallPlugin.length > 0) {
      //     await installPluginSync(needInstallPlugin, imgcookModulesPath);
      //   }
      // }
      if (plugin.length > 0) {
        let config = {
          ...configData,
          value
        };
        let rdata = {
          data,
          filePath,
          config
        };
        for (const pluginItem of plugin) {
          const pluginItemPath = `${imgcookModulesPath}/node_modules/${pluginItem}`;
          rdata = await require(pluginItemPath)(rdata);
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
        logger.error(data.errorList);
        isSuccess = false;
      }
    } else {
      logger.error(errorData);
      isSuccess = false;
    }

    if (!moduleData && repoData.errorMsg) {
      spinner.fail(repoData.errorMsg);
      return;
    }

    if (isSuccess) {
      spinner.succeed(`「${moduleData.name}」Download completed.`);
    } else {
      spinner.fail(`「${moduleData.name}」Download failed.`);
    }
  }
  if (!repoData.success || repoData.success === 'false') {
    if (repoData.code && repoData.code.message) {
      spinner.fail(`${repoData.code.message}`);
    } else if (typeof repoData === 'string') {
      spinner.fail('Export code exception.');
    } else {
      spinner.fail(`${repoData.errorMsg}`);
    }
  }
};

module.exports = (...args) => {
  return pull(...args).catch(err => {
    logger.error(err);
  });
};
