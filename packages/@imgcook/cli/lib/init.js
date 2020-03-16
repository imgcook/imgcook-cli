const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fse = require('fs-extra');
const cwd = process.cwd();
const logger = require('./logger');
const { cliConfig } = require('./helper');
const imgcookModulesPath = cliConfig.imgcookModules;

const init = async (value, option) => {
  let name = value;
  let data;
  let configData = {};
  if (typeof name !== 'string') {
    name = 'imgcook_demo';
  }
  // Check config file
  if (fse.existsSync(cliConfig.configFile)) {
    configData = await fse.readJson(cliConfig.configFile);
  } else {
    // Set if the configuration is empty
    require('./config')('set', {});
  }
  try {
    const folderPath = path.join(cwd, name);
    const generator = configData.generator || [];
    if (generator.length > 0) {
      for (const generatorItem of generator) {
        const generatorItemPath = `${imgcookModulesPath}/node_modules/${generatorItem}`;
        data = await require(generatorItemPath)({
          data,
          filePath: folderPath,
          config: configData,
          cmd: {
            value,
            ...option
          },
          folderPath,
          name,
        });
      }
    } else {
      console.log(chalk.red('No「Generator」plugin configured.'))
    }
  } catch (error) {
    logger.error(error);
  }
};

module.exports = (...args) => {
  return init(...args).catch(err => {
    logger.error(err);
  });
};
