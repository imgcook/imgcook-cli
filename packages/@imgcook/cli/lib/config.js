const dsl = [
  {
    name: 'H5 标准开发规范',
    id: '5'
  },
  {
    name: 'React 开发规范',
    id: '12'
  },
  {
    name: 'Vue 开发规范',
    id: '29'
  },
  {
    name: '微信小程序开发规范',
    id: '21'
  },
  {
    name: 'Rax 标准开发规范',
    id: '1'
  }
];
let curDslId = '12';
let promptConfig = [
  {
    type: 'input',
    name: 'accessId',
    message: 'Access ID',
    default: '7YI3Z4afVQxje3cU'
  },
  {
    type: 'list',
    name: 'dslId',
    message: 'Dsl',
    choices: [
      'H5 标准开发规范',
      'React 开发规范',
      'Vue 开发规范',
      '微信小程序开发规范',
      'Rax 标准开发规范'
    ],
    default: '',
    filter: val => {
      for (const item of dsl) {
        if (item.name === val) {
          curDslId = item.id;
        }
      }
      return curDslId;
    }
  },
  {
    type: 'checkbox',
    name: 'loaders',
    message: 'Loaders',
    default: ['@imgcook/cli-loader-images'],
    choices: ['@imgcook/cli-loader-images']
    // filter: val => {
    //   const loaders = [];
    //   for (const item of val) {
    //     loaders.push({
    //       option: {
    //         uploadUrl: ''
    //       },
    //       loader: item,
    //     });
    //   }
    //   return loaders;
    // }
  },
  {
    type: 'list',
    name: 'plugins',
    message: 'Plugin',
    default: ['@imgcook/cli-plugin-generate'],
    choices: ['@imgcook/cli-plugin-generate']
  }
];

const fse = require('fs-extra');
const { cliConfig } = require('./helper');
const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const ora = require('ora');
const childProcess = require('child_process');
const spinner = ora();

const initConfig = (promptConfig, config) => {
  config.accessId && (promptConfig[0].default = config.accessId);
  if (config.dslId) {
    curDslId = config.dslId;
    for (const item of dsl) {
      if (item.id === curDslId) {
        promptConfig[1].default = item.name;
      }
    }
  }
  if (config.loaders.length > 0) {
    promptConfig[2].default = config.loaders;
    promptConfig[2].choices = config.loaders;
  }
  if (config.plugins) {
    promptConfig[3].default = config.plugins;
    promptConfig[3].default = config.plugins;
  }
  return promptConfig;
};

const config = async (value, option) => {
  let configData = {};
  // 检查是否存在配置文件
  if (fse.existsSync(cliConfig.configFile)) {
    configData = await fse.readJson(cliConfig.configFile);
  } else {
    // 如果配置为空则去设置
    value = 'set';
  }
  if (value === 'edit') {
    childProcess.execSync(`open ${cliConfig.configFile}`);
    return;
  }
  if (value !== 'set' && !option.set && !option.get && !option.remove) {
    console.log(JSON.stringify(configData, null, 2));
  }
  if (value === 'set') {
    promptConfig = initConfig(promptConfig, configData);
    inquirer.prompt(promptConfig).then(async answers => {
      if (!fse.existsSync(`${cliConfig.path}`)) {
        fse.mkdirSync(`${cliConfig.path}`);
      }
      const dirname = path.join(__dirname, '../');
      if (configData.uploadUrl) {
        answers.uploadUrl = configData.uploadUrl;
      } else {
        answers.uploadUrl = '';
      }
      await fse.writeFile(
        cliConfig.configFile,
        JSON.stringify(answers, null, 2),
        'utf8'
      );
      // spinner.start('安装依赖中...');
      const loaders = answers.loaders;
      if (loaders.length > 0) {
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
      const plugins = answers.plugins;
      if (plugins !== '') {
        try {
          // 安装plugin 依赖
          spinner.start(`安装 ${plugins} 依赖中...`);
          childProcess.execSync(`cd ${dirname} && npm install ${plugins}`);
          spinner.succeed(`安装 ${plugins} 完成...`);
        } catch (error) {
          spinner.fail(`安装 ${plugins} 失败。`);
        }
      }
    });
  }
  if (option.set && value) {
    set(configData, option.set, value);
    await fse.writeFile(
      cliConfig.configFile,
      JSON.stringify(configData, null, 2),
      'utf8'
    );
    if (option.set === 'loaders' || option.set === 'plugins') {
      const dirname = path.join(__dirname, '../');
      childProcess.execSync(`cd ${dirname} && npm install ${value}`);
    }
    console.log(chalk.green('设置成功。'));
  }
  if (option.remove) {
    remove(configData, option.remove, value);
    await fse.writeFile(
      cliConfig.configFile,
      JSON.stringify(configData, null, 2),
      'utf8'
    );
    if (option.remove === 'loaders' || option.remove === 'plugins') {
      const dirname = path.join(__dirname, '../');
      childProcess.execSync(`cd ${dirname} && npm uninstall ${value}`);
    }
    console.log(chalk.green('删除成功。'));
  }
  if (option.get) {
    if (option.get) {
      const value = get(configData, option.get);
      if (option.json) {
        console.log(
          JSON.stringify(
            {
              value
            },
            null,
            2
          )
        );
      } else {
        console.log(value);
      }
    }
  }
};

module.exports = (...args) => {
  return config(...args).catch(err => {
    console.log(chalk.red(err));
  });
};

const get = (target, path) => {
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      return undefined;
    }
    obj = obj[key];
  }
  return obj[fields[l - 1]];
};

const set = function(target, path, value) {
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  if (fields[l - 1] === 'loaders') {
    if (obj[fields[l - 1]].length > 0) {
      for (const item of obj[fields[l - 1]]) {
        if (item !== value) {
          obj[fields[l - 1]].push(value);
        }
      }
    } else {
      obj[fields[l - 1]].push(value);
    }
  } else {
    obj[fields[l - 1]] = value;
  }
};

const remove = function(target, path, value) {
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  const key = fields[l - 1];
  if (key === 'loaders') {
    target[key] = removeItem(target[key], value);
  } else {
    target[key] = '';
  }

  return target;
};

const removeItem = (arr, key) => {
  arr.splice(arr.findIndex(item => item === key), 1);
  return arr;
};
