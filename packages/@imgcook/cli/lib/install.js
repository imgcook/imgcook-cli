const chalk = require('chalk');
const fse = require('fs-extra');
const { cliConfig, installPlugin } = require('./helper');

const install = async (value, option) => {
  let configData = {};
  const imgcookModulesPath = cliConfig.imgcookModules;
  if (fse.existsSync(cliConfig.configFile)) {
    configData = await fse.readJson(cliConfig.configFile);
  }

  if (!fse.existsSync(`${imgcookModulesPath}`)) {
    fse.mkdirSync(`${imgcookModulesPath}`);
  }

  // 安装generator
  if (value === 'generator') {
    const generator = configData.generator;
    installPlugin(generator, imgcookModulesPath);
  }

  // 安装plugin
  if (value === 'plugin') {
    const plugin = configData.plugin;
    installPlugin(plugin, imgcookModulesPath);
  }

  // 安装generator和plugin
  if (value !== 'generator' && value !== 'plugin') {
    if (typeof option.name === 'function' && value === undefined) {
      const generator = configData.generator;
      let plugin = configData.plugin;
      plugin = plugin.concat(generator);
      installPlugin(plugin, imgcookModulesPath);
    } else {
      installPlugin([value], imgcookModulesPath);
    }
  }
};

module.exports = (...args) => {
  return install(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
