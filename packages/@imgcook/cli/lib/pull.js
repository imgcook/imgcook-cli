const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const spinner = ora();
const cwd = process.cwd();

const { ajaxPost, writeFile, cliConfig } = require('./helper');

const pull = async (value, option) => {
  let filePath = cwd; 
  let inApp = option.app; // 是否处于 imgcook app 模式
  
  if (option.path) {
    filePath = path.isAbsolute(option.path) ? option.path : path.join(cwd, option.path);
  } else if (option.app) {
    filePath = path.join( cwd, 'src/mods/', `mod${value}` );
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
  let url = cliConfig.module.url;
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
        const loaders = configData.loaders;
        /**
         * fileValue string
         */
        let fileValue = item.panelValue;
        if (loaders.length > 0) {
          for (const loaderItem of loaders) {
            if (fileValue && !fileValue.match('.alicdn.com/tfs/')) {
              fileValue = await require(loaderItem)(fileValue, {
                item,
                filePath,
                index,
                config: configData,
                moduleData,
              });
            }
          }
        }
        const plugin = configData.plugins;
        if (plugin !== '') {
          try {
            backData = await require(plugin)(fileValue, {
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

    if ( option.app ) {
      // 检索mods目录更新索引
      try {
        let modList = [];
        let string = '';
        modList = fs.readdirSync( path.join( cwd, 'src/mods/') ).filter((v) => {
          return v !== 'index.js';
        });
        modList.map((name) => {
          string += `import ${name} from './${name}'\n`;
        });
        string += 'export default {\n';
        modList.map((name) => {
          string += `\t${name},\n`;
        });
        string += '}';
        fs.writeFileSync( path.join( cwd, 'src/mods/index.js' ), string, 'utf-8' );
        spinner.succeed(` 索引文件 index.js 更新完成`);
      } catch(error) {
        console.log(chalk.red(`update link file error: ${error}`));
      }
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
