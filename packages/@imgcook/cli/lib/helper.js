const request = require('request');
const fs = require('fs');
const chalk = require('chalk');
const childProcess = require('child_process');

// Post请求
const ajaxPost = (url, param) => {
  return new Promise(resolve => {
    request.post(
      url,
      {
        form: param.data,
        json: true
      },
      function(err, res, body) {
        if (err) {
          console.log(chalk.red(JSON.stringify(err)));
        }
        resolve(body);
      }
    );
  });
};

// 写文件
const writeFile = (content, filePath, code) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      filePath,
      content,
      code,
      data => {
        resolve({
          ...data,
          filePath
        });
      },
      err => {
        reject({
          ...err,
          filePath
        });
      }
    );
  });
};

const rmFile = file => {
  childProcess.execSync(`rm -rf ${file}`);
};

const { homedir } = require('@imgcook/cli-utils');
const userhome = homedir();
const imgcookConfigPath = `${userhome}/.imgcook`;
const imgcookRc = `${imgcookConfigPath}/.imgcookrc`;
const cliConfig = {
  path: imgcookConfigPath,
  configFile: imgcookRc,
  module: {
    url: 'https://imgcook.taobao.org/api-open/code-acquire'
  }
};

// eg：hello-world => helloWorld
function toHump(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}

function cleanArgs(cmd) {
  const args = {};
  cmd.options.forEach(o => {
    const key = toHump(o.long.replace(/^--/, ''));
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key];
    }
  });
  return args;
}

module.exports = {
  ajaxPost,
  writeFile,
  rmFile,
  cliConfig,
  toHump,
  cleanArgs
};
