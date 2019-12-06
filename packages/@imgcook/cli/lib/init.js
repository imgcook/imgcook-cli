const ora = require('ora');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const spinner = ora();
const cwd = process.cwd();
const childProcess = require('child_process');

const init = async (value, option) => {
  let folderPath = path.join( cwd, 'imgcook-app' ) ; // tb-test
  if ( fs.existsSync(folderPath) ) {
    console.log('当前目录已有名为 imgcook-app 的项目，请 `cd imgcook-app && yarn start` 后访问 http://localhost:3000');
    return;
  }
  cpAsset( folderPath );
};

const cpAsset = (folderPath) => {
  const assetsDirname = path.join( __dirname, '../assets');
  try {
    spinner.start(`为你初始化 imgcook 预览应用中...`);
    childProcess.exec(`cp -rf ${ assetsDirname } ${ folderPath }`, {

    }, () => {
      let fileList = fs.readdirSync(folderPath);
      fileList.map((file) => {
        if ( /^__\S+__$/.test( file ) ) {
          fs.renameSync( path.join( folderPath, file ), path.join( folderPath, file.slice(2, file.length - 2 ) ) );
        }
      });
      spinner.succeed("应用 `imgcook-app` 初始化完成");
      spinner.succeed("执行 `cd imgcook-app && yarn install && yarn start` 后访问 http://localhost:3000 查看您的预览页面");
      spinner.succeed("在 `imgcook-app` 目录中，您可以 `imgcook pull -a 模块id`，查看您的模块预览效果");
    });
  } catch (error) {
    spinner.fail("预览应用 `imgcook-app` 初始化失败");
  }
};

module.exports = (...args) => {
  return init(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
