const request = require('request');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const childProcess = require('child_process');

const spinner = ora();
const domain = 'https://www.imgcook.com';

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

const ajaxGet = (url, param) => {
  return new Promise(resolve => {
    request(url, function(err, res, body) {
      if (err) {
        console.log(chalk.red(JSON.stringify(err)));
      }
      resolve(body);
    });
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
const imgcookModules = `${imgcookConfigPath}/imgcook_modules`;
const cliConfig = {
  path: imgcookConfigPath,
  configFile: imgcookRc,
  imgcookModules,
  module: {
    url: `${domain}/api-open/code-acquire`
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

const installPlugin = (plugin, dirname) => {
  if (plugin.length > 0) {
    try {
      for (const item of plugin) {
        spinner.start(`install...`);
        const cmd = `npm install --prefix ${dirname} ${item}`;
        childProcess.exec(cmd, () => {
          spinner.succeed(`install ${item} complete.`);
        });
      }
    } catch (error) {
      spinner.fail(`install ${error} fail.`);
    }
  }
};

const installPluginSync = async (plugin, dirname) => {
  if (plugin.length > 0) {
    try {
      for (const item of plugin) {
        const cmd = `npm install --prefix ${dirname} ${item}`;
        childProcess.execSync(cmd);
      }
    } catch (error) {
      // console.log(error);
    }
  }
};

const get = (target, path) => {
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      return undefined;
    }
    obj = obj[key];
  }
  return obj[fields[l - 1]];
};

const set = function(option) {
  const { target, path, value, type } = option;
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  if (fields[l - 1] === type) {
    if (obj[fields[l - 1]].length > 0) {
      for (const item of obj[fields[l - 1]]) {
        if (item !== value) {
          obj[fields[l - 1]].push(value);
        }
      }
    } else {
      obj[fields[l - 1]].push(value);
    }
  } else {
    obj[fields[l - 1]] = value;
  }
};

const remove = function(option) {
  const { target, path, value, type } = option;
  const fields = path.split('.');
  let obj = target;
  const l = fields.length;
  for (let i = 0; i < l - 1; i++) {
    const key = fields[i];
    if (!obj[key]) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  const key = fields[l - 1];
  if (key === type) {
    target[key] = removeItem(target[key], value);
  } else {
    target[key] = '';
  }

  return target;
};

const removeItem = (arr, key) => {
  arr.splice(
    arr.findIndex(item => item === key),
    1
  );
  return arr;
};

const syncConfig = async option => {
  const { config } = option;
  const apiUrl = `${domain}/api-open/v2/getTeamConfig?access_id=${config.accessId}`;
  const moduleConfigData = await ajaxGet(apiUrl);
  const moduleConfig = JSON.parse(moduleConfigData) || {};
  const tenantConfig = moduleConfig.data.tenantConfig;
  const pluginConfig =
    (tenantConfig.pluginConfig && JSON.parse(tenantConfig.pluginConfig)) || {};
  return {
    pluginConfig
  };
};

const getTokenInfo = async option => {
  const { config } = option;
  const apiUrl = `${domain}/api-open/v2/getTokenInfo?access_id=${config.accessId}`;
  const tokenInfo = await ajaxGet(apiUrl);
  const tokenInfoJson = JSON.parse(tokenInfo) || {};
  if (tokenInfoJson.status) {
    return {
      ...tokenInfoJson.data
    };
  } else {
    return {
      ...tokenInfoJson
    };
  }
};

const getTeamInfo = async option => {
  const { config, id, type } = option;
  if (!id) {
    console.error(chalk.red('缺少id，执行 `imgcook config sync --id <moduleId>'));
    return {};
  }
  const apiUrl = `${domain}/api-open/v2/getTeamInfo?access_id=${config.accessId}&id=${id}&type=${type}`;
  const moduleConfigData = await ajaxGet(apiUrl);
  const moduleConfig = JSON.parse(moduleConfigData) || {};
  const tenantConfig = moduleConfig.data.tenantConfig || {};
  const pluginConfig =
    (tenantConfig.pluginConfig && JSON.parse(tenantConfig.pluginConfig)) || {};
  return {
    pluginConfig
  };
};

const getPlugin = async option => {
  const tokenInfo = await getTokenInfo(option);
  let plugin = [];
  let generator = [];
  let pluginData = [];
  let generatorData = [];
  let teamConfig = {};
  if (tokenInfo.customerType === 'app') {
    teamConfig = await syncConfig(option);
  } else if (tokenInfo.customerType === 'user') {
    teamConfig = await getTeamInfo(option);
  }
  const pluginConfig = teamConfig.pluginConfig || {};
  pluginData = pluginConfig.list || [];
  generatorData = pluginConfig.scaffold || [];

  for (const item of generatorData) {
    generator.push(item.name);
  }
  for (const item of pluginData) {
    plugin.push(item.name);
  }

  return {
    plugin,
    generator
  };
};

module.exports = {
  ajaxPost,
  ajaxGet,
  writeFile,
  rmFile,
  cliConfig,
  toHump,
  cleanArgs,
  installPlugin,
  installPluginSync,
  get,
  set,
  remove,
  removeItem,
  syncConfig,
  getTokenInfo,
  getPlugin
};
