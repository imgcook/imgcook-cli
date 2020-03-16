const chalk = require('chalk');
const fse = require('fs-extra');
const { cliConfig, installPlugin } = require('./helper');
const logger = require('./logger');

const install = async (value, option) => {
  let configData = {};
  const imgcookModulesPath = cliConfig.imgcookModules;
  if (fse.existsSync(cliConfig.configFile)) {
    configData = await fse.readJson(cliConfig.configFile);
  }

  if (!fse.existsSync(`${imgcookModulesPath}`)) {
    fse.mkdirSync(`${imgcookModulesPath}`);
  }

  // install generator
  if (value === 'generator') {
    const generator = configData.generator;
    installPlugin(generator, imgcookModulesPath);
  }

  // install plugin
  if (value === 'plugin') {
    const plugin = configData.plugin;
    installPlugin(plugin, imgcookModulesPath);
  }

  // install generator and plugin
  if (value !== 'generator' && value !== 'plugin') {
    if (typeof option.name === 'function' && value === undefined) {
      const generator = configData.generator;
      let plugin = configData.plugin;
      if (!plugin) {
        console.log('No plugins install');
        return;
      }
      plugin = plugin.concat(generator);
      installPlugin(plugin, imgcookModulesPath);
    } else {
      installPlugin([value], imgcookModulesPath);
    }
  }
};

module.exports = (...args) => {
  return install(...args).catch(err => {
    logger.error(err);
  });
};
