const fse = require('fs-extra');
const chalk = require('chalk');

const generatePlugin = async (value, option) => {
  await fse.writeFile(
    `${option.filePath}/${option.panelName}`,
    value,
    'utf8'
  );
  return {
    ...option,
    message: 'succeed',
  };
};

module.exports = (...args) => {
  return generatePlugin(...args).catch(err => {
    console.log(chalk.red(err));
  });
};