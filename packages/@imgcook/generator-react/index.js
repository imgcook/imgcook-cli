/**
 * Copyright(c) xxx Holding Limited.
 *
 * Authors: xx
 */
const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fse = require('fs-extra');
const spinner = ora();
const cwd = process.cwd();
const childProcess = require('child_process');

/**
 * @param {object} option: { filePath, index, config }
 */
const generateReactProjectPlugin = async (option) => {
  const { folderPath, name } = option;
  if (fse.existsSync(folderPath)) {
    console.log(chalk.red(
      `当前目录已有名为 ${name} 的项目，请 \`cd ${name} && yarn start\` 后访问 http://localhost:3000`
    ));
    return;
  }
  if (!fse.existsSync(`${folderPath}`)) {
    fse.mkdirSync(`${folderPath}`);
  }
  cpAsset({ folderPath, name });

  return option;
};

module.exports = (...args) => {
  return generateReactProjectPlugin(...args).catch(err => {
    console.log(chalk.red(err));
  });
};


const cpAsset = (option) => {
  const { folderPath, name } = option;
  const assetsDirname = `${__dirname}/assets/*`;
  try {
    spinner.start(`为你初始化 imgcook 预览应用中...`);
    childProcess.exec(`cp -rf ${assetsDirname} ${folderPath}`, {}, () => {
      let fileList = fse.readdirSync(folderPath);
      fileList.map(file => {
        if (/^__\S+__$/.test(file)) {
          fse.renameSync(
            path.join(folderPath, file),
            path.join(folderPath, file.slice(2, file.length - 2))
          );
        }
      });
      spinner.succeed(`应用 \`${name}\` 初始化完成`);
      spinner.succeed(
        `执行 \`cd ${name} && yarn install && yarn start\` 后访问 http://localhost:3000 查看您的预览页面`
      );
      spinner.succeed(
        `在 \`${name}\` 目录中，您可以 \`imgcook pull -a 模块id\`，查看您的模块预览效果`
      );
    });
  } catch (error) {
    spinner.fail(`预览应用 \`${name}\` 初始化失败`);
  }
};