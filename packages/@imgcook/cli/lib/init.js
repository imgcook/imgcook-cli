const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const spinner = ora();
const cwd = process.cwd();
const childProcess = require('child_process');
const PluginReact = require('@imgcook/cli-plugin-react');

const init = async (value, option) => {
  const folderPath = path.join(cwd, value);
  console.log(value);
  console.log(option);
  // console.log(await PluginReact({folderPath, name: value}))
};


module.exports = (...args) => {
  return init(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
