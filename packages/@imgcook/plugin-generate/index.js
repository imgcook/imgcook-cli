const fse = require('fs-extra');
const chalk = require('chalk');

const generatePlugin = async option => {
  let { data } = option;
  let result = {};
  const { filePath } = option;
  const panelDisplay = data.code.panelDisplay;
  let index = 0;
  for (const item of panelDisplay) {
    let value = item.panelValue;
    const { panelName } = item;
    let outputFilePath = `${filePath}/${panelName}`;
    if (item && item.filePath) {
      let str = item.filePath;
      if (typeof str === 'string') {
        str =
          str.substring(str.length - 1) == '/'
            ? str.substring(0, str.length - 1)
            : str;
      }
      const strArr = str.split('/');
      let folder = `${option.filePath}`;
      for (const strItem of strArr) {
        folder = `${folder}/${strItem}`;
        if (!fse.existsSync(folder)) {
          fse.mkdirSync(folder);
        }
      }
      outputFilePath = `${filePath}/${item.filePath}${panelName}`;
    }

    // 针对 package 依赖 merge 处理
    try {
      if (panelName === 'package.json') {
        const packagePath = `${filePath}/package.json`;
        const newPackage = JSON.parse(value) || null;
        if (newPackage && fse.existsSync(packagePath)) {
          let packageJson = await fse.readJson(packagePath);
          if (!packageJson.dependencies) {
            packageJson.dependencies = {};
          }
          const newDependencies = Object.assign(
            newPackage,
            packageJson.dependencies
          );
          packageJson.dependencies = newDependencies;
          value = JSON.stringify(packageJson, null, 2);
        }
      }
    } catch (error) {
      result = error;
      console.error(error);
    } finally {
    }
    await fse.writeFile(outputFilePath, value, 'utf8');
    index++;
  }

  return result;
};

module.exports = (...args) => {
  return generatePlugin(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
