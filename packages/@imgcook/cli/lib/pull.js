const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const spinner = ora();
const cwd = process.cwd();

const { ajaxPost, cliConfig } = require('./helper');

const pull = async (value, option) => {
  let filePath = cwd;

  if (option.path) {
    filePath = path.isAbsolute(option.path)
      ? option.path
      : path.join(cwd, option.path);
  } else if (option.app) {
    filePath = path.join(cwd, 'src/mods/', `mod${value}`);
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
      const plugin = configData.plugin || [];
      if (plugin.length > 0) {
        for (const pluginItem of plugin) {
          const pluginItemPath = `${imgcookModulesPath}/node_modules/${pluginItem}`;
          data = await require(pluginItemPath)({
            data,
            filePath,
            config: configData
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

    if (option.app) {
      // 检索mods目录更新索引
      try {
        let modList = [];
        let string = '';
        modList = fs.readdirSync(path.join(cwd, 'src/mods/')).filter(v => {
          return v !== 'index.js';
        });
        modList.map(name => {
          string += `import ${name} from './${name}'\n`;
        });
        string += 'export default {\n';
        modList.map(name => {
          string += `\t${name},\n`;
        });
        string += '}';
        fs.writeFileSync(path.join(cwd, 'src/mods/index.js'), string, 'utf-8');
        spinner.succeed(` 索引文件 index.js 更新完成`);
      } catch (error) {
        console.log(chalk.red(`update link file error: ${error}`));
      }
    }

    if (!errorData) {
      moduleData && spinner.succeed(`「${moduleData.name}」模块下载完成`);
    } else {
      spinner.fail(`「${moduleData.name}」模块下载失败`);
      console.error(errorData);
    }
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
