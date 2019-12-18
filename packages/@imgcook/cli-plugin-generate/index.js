const fse = require('fs-extra');
const chalk = require('chalk');

const generatePlugin = async (value, option) => {
  let filePath = `${option.filePath}/${option.panelName}`;
  if (option.item && option.item.filePath) {
    let str = option.item.filePath;
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
    filePath = `${option.filePath}/${option.item.filePath}${option.panelName}`;
  }

  // Depend on merge processing for package
  try {
    if (option.panelName === 'package.json') {
      const packagePath = `${option.filePath}/package.json`;
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
    console.log(error);
  } finally {
  }

  await fse.writeFile(filePath, value, 'utf8');
  return {
    ...option,
    message: 'succeed'
  };
};

module.exports = (...args) => {
  return generatePlugin(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
