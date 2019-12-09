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
    name: '支付宝小程序开发规范',
    id: '79'
  },
  {
    name: 'Rax 标准开发规范',
    id: '1'
  },
  {
    name: '微信小程序开发规范',
    id: '21'
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
    message: 'DSL',
    choices: [
      'H5 标准开发规范',
      'React 开发规范',
      'Vue 开发规范',
      '支付宝小程序开发规范',
      'Rax 标准开发规范',
      '微信小程序开发规范'
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
    name: 'generator',
    message: 'Generator',
    default: ['@imgcook/generator-react'],
    choices: ['@imgcook/generator-react']
  },
  {
    type: 'checkbox',
    name: 'plugin',
    message: 'Plugin',
    default: ['@imgcook/plugin-images', '@imgcook/plugin-generate'],
    choices: ['@imgcook/plugin-images', '@imgcook/plugin-generate']
  }
];

const fse = require('fs-extra');
const { cliConfig, installPlugin } = require('./helper');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const childProcess = require('child_process');

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
  // if (config.loader && config.loader.length > 0) {
  //   promptConfig[2].default = config.loader;
  //   promptConfig[2].choices = config.loader;
  // }
  if (config.plugin) {
    promptConfig[3].default = config.plugin;
    promptConfig[3].default = config.plugin;
  }
  return promptConfig;
};

const config = async (value, option) => {
  let configData = {};
  const imgcookModulesPath = cliConfig.imgcookModules;

  if (!fse.existsSync(`${cliConfig.path}`)) {
    fse.mkdirSync(`${cliConfig.path}`);
  }

  // 检查是否存在配置文件
  if (fse.existsSync(cliConfig.configFile)) {
    configData = await fse.readJson(cliConfig.configFile);
  } else if (!option.set && !option.get && !option.remove) {
    // 如果配置为空则去设置
    value = 'set';
  }

  if (!fse.existsSync(`${imgcookModulesPath}`)) {
    fse.mkdirSync(`${imgcookModulesPath}`);
  }

  // 编辑
  if (value === 'edit') {
    childProcess.exec(`open ${cliConfig.configFile}`);
    return;
  }

  // 不存在指令
  if (value !== 'set' && !option.set && !option.get && !option.remove) {
    const result = JSON.stringify(configData, null, 2);
    console.log(result);
    return result;
  }

  // 设置
  if (value === 'set') {
    promptConfig = initConfig(promptConfig, configData);
    inquirer.prompt(promptConfig).then(async answers => {
      if (!fse.existsSync(`${cliConfig.path}`)) {
        fse.mkdirSync(`${cliConfig.path}`);
      }
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
      const generator = answers.generator || [];
      let plugin = answers.plugin || [];
      plugin = plugin.concat(generator);
      installPlugin(plugin, imgcookModulesPath);
    });
  }
  if (option.set && value) {
    if (!fse.existsSync(`${cliConfig.path}`)) {
      fse.mkdirSync(`${cliConfig.path}`);
    }
    set({
      target: configData,
      path: option.set,
      value,
      type: option.set
    });
    await fse.writeFile(
      cliConfig.configFile,
      JSON.stringify(configData, null, 2),
      'utf8'
    );
    if (option.set === 'generator' || option.set === 'plugin') {
      installPlugin([value], imgcookModulesPath);
    }
    const message = chalk.green(`设置 ${value} 成功`);
    console.log(message);
  }
  if (option.remove) {
    remove({
      target: configData,
      path: option.remove,
      value,
      type: option.remove
    });
    await fse.writeFile(
      cliConfig.configFile,
      JSON.stringify(configData, null, 2),
      'utf8'
    );
    if (option.remove === 'generator' || option.remove === 'plugin') {
      try {
        childProcess.execSync(
          `cd ${imgcookModulesPath}/node_modules && rm -rf ${value}`
        );
      } catch (error) {
        console.error(error);
      }
    }
    console.log(chalk.green(`删除 ${value} 成功`));
  }
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

const set = function(option) {
  const { target, path, value, type } = option;
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
  if (fields[l - 1] === type) {
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

const remove = function(option) {
  const { target, path, value, type } = option;
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
  if (key === type) {
    target[key] = removeItem(target[key], value);
  } else {
    target[key] = '';
  }

  return target;
};

const removeItem = (arr, key) => {
  arr.splice(
    arr.findIndex(item => item === key),
    1
  );
  return arr;
};
