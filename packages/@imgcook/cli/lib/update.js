
const childProcess = require('child_process');
const ora = require('ora');
const spinner = ora();
const logger = require('./logger');

const update = async (value, option) => {
  try {
    spinner.start(`Update imgcook cli...`);
    childProcess.exec('npm install -g @imgcook/cli', () => {
      spinner.succeed(`Update complete.`);
    });
    
  } catch (error) {
    spinner.fail(`Update fail. Error: ${error}`);
  }
};

module.exports = (...args) => {
  return update(...args).catch(err => {
    logger.error(err);
  });
};
