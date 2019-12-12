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
    validate: val => {
      if (val.match(/\w{16}/g)) {
        return true;
      }
      return '请输入 16 位的 Access ID, 打开 https://www.imgcook.com 移到右上角头像点击菜单里个人页面，点击左上方用户昵称查看';
    }
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
    default: ['@imgcook/plugin-generate'],
    choices: ['@imgcook/plugin-images', '@imgcook/plugin-generate']
  }
];

const fse = require('fs-extra');
const {
  cliConfig,
  installPlugin,
  remove,
  get,
  set,
  getPlugin
} = require('./helper');
const inquirer = require('inquirer');
const chalk = require('chalk');
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
    try {
      configData = await fse.readJson(cliConfig.configFile);
    } catch (error) {
      configData = {};
    }
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

  if (value === 'sync') {
    spinner.start(`Synching...`);
    const pluginData = await getPlugin({
      config: configData,
      id: option.id,
      type: 'module'
    });
    const { generator, plugin } = pluginData;
    for (const item of generator) {
      configData.generator = [];
      set({
        target: configData,
        path: 'generator',
        value: item,
        type: 'generator'
      });
    }
    for (const item of plugin) {
      configData.plugin = [];
      set({
        target: configData,
        path: 'plugin',
        value: item,
        type: 'plugin'
      });
    }
    await fse.writeFile(
      cliConfig.configFile,
      JSON.stringify(configData, null, 2),
      'utf8'
    );
    spinner.succeed(`Complete.`);
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
    const message = chalk.green(`设置 ${option.set} 成功`);
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
    console.log(chalk.green(`删除 ${option.remove} 成功`));
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
