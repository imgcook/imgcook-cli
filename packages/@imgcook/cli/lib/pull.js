const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const spinner = ora();
const cwd = process.cwd();

const { ajaxPost, writeFile, cliConfig } = require('./helper');

const pull = async (value, option) => {
  let filePath = cwd;
  if (option.path) {
    filePath = path.isAbsolute(option.path) ? option.path : path.join(cwd, option.path);
  }
  if(!fs.existsSync(cliConfig.configFile)) {
    console.log("请先设置配置，执行`imgcook config set`");
    const inquirer = require('inquirer');
    inquirer.prompt({
      type: "confirm",
      message: "是否开始设置？",
      name: "set"
    }).then(async answers => {
      if (answers.set) {
        require('./config')('set', {});
      }
    });
    return;
  }  
  let configData = fs.readFileSync(cliConfig.configFile, 'UTF-8');
  configData = JSON.parse(configData);
  const url = cliConfig.module.url;
  const imgcookModulesPath = cliConfig.imgcookModules;
  const repoData = await ajaxPost(url, {
    data: {
      dsl_id: configData.dslId,
      access_id: configData.accessId,
      mod_id: value
    }
  });
  if (repoData.data && repoData.data.code) {
    const moduleData = repoData.data.moduleData;
    spinner.start(`「${moduleData.name}」模块下载中...`);
    let index = 0;
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    let pullFileMsg = [];
    for (const item of repoData.data.code.panelDisplay) {
      try {
        // execute loader
        const loader = configData.loader;
        /**
         * fileValue string
         */
        let fileValue = item.panelValue;
        if (loader.length > 0) {
          for (const loaderItem of loader) {
            if (!fileValue.match('.alicdn.com/tfs/')) {
              fileValue = await require(`${imgcookModulesPath}/node_modules/${loaderItem}`)(fileValue, {
                item,
                filePath,
                index,
                config: configData,
                moduleData,
              });
            }
          }
        }
        const plugin = configData.plugin;
        if (plugin) {
          try {
            backData = await require(`${imgcookModulesPath}/node_modules/${plugin}`)(fileValue, {
              filePath,
              item,
              panelName: item.panelName,
            });
            pullFileMsg.push(backData);
          } catch (error) {
            console.log(chalk.red(error));
          }
        } else {
          await writeFile(fileValue, `${filePath}/${item.panelName}`, 'utf8');
        }
      } catch (error) {
        console.log(chalk.red(`execute code error: ${error}`));
      }

      index++;
    }
  
    // delete images/.imgrc
    const imgrcPath = `${filePath}/images/.imgrc`;
    if (fs.existsSync(imgrcPath)) {
      fs.unlinkSync(imgrcPath);
    }

    spinner.succeed(`「${moduleData.name}」模块下载完成`);
  }
  if (!repoData.success) {
    if (repoData.code && repoData.code.message) {
      console.log(chalk.red(`Error: ${repoData.code.message}`));
    } else {
      console.log(chalk.red(`Error: ${repoData.message}`));
    }
  }
};

module.exports = (...args) => {
  return pull(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
