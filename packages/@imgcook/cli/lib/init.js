const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fse = require('fs-extra');
const cwd = process.cwd();
const { cliConfig } = require('./helper');
const imgcookModulesPath = cliConfig.imgcookModules;

const init = async (value, option) => {
  let name = value;
  let data;
  let configData = {};
  if (typeof name !== 'string') {
    name = 'test';
  }
  // 检查是否存在配置文件
  if (fse.existsSync(cliConfig.configFile)) {
    configData = await fse.readJson(cliConfig.configFile);
  } else {
    // 如果配置为空则去设置
    require('./config')('set', {});
  }
  try {
    const folderPath = path.join(cwd, name);
    const generator = configData.generator || [];
    if (generator.length > 0) {
      for (const generatorItem of generator) {
        const generatorItemPath = `${imgcookModulesPath}/node_modules/${generatorItem}`;
        data = await require(generatorItemPath)({
          folderPath,
          name: value,
          data
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = (...args) => {
  return init(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
