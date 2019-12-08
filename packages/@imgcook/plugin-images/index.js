const fs = require('fs');
const { unique, downloadImg } = require('@imgcook/cli-utils');
const UPLOAD = require('./lib/upload');
const upload = new UPLOAD();

const uploadData = (file, filepath, option) => {
  return new Promise(resolve => {
    upload.uploadUrl = option.uploadUrl;
    upload
      .start(file, {
        filepath: filepath
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        // console.log(JSON.stringify(err));
      });
  });
};

const loader = async (option) => {
  let imgArr = [];
  let { data } = option;
  const { filePath } = option;
  const panelDisplay = data.code.panelDisplay;
  const moduleData = data.moduleData;
  let index = 0;
  for (const item of panelDisplay) {
    let fileValue = item.panelValue;
    const temporaryImages = `${(
      new Date().getTime() + Math.floor(Math.random() * 10000)
    ).toString(30)}`;
    imgArr = fileValue.match(
      /(https?):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|](\.png|\.jpg)/g
    );
    if (imgArr && imgArr.length > 0) {
      imgArr = unique(imgArr);
      const imgPath = `${filePath}/images`;
      let imgObj = [];
      const imgrc = `${imgPath}/.imgrc`;
      if (fs.existsSync(imgrc)) {
        let imgConfig = fs.readFileSync(imgrc, 'utf8');
        imgObj = JSON.parse(imgConfig) || [];
      }
      for (let idx = 0; idx < imgArr.length; idx++) {
        if (!fs.existsSync(imgPath)) {
          fs.mkdirSync(imgPath);
        }
        let suffix = imgArr[idx].split('.');
        suffix = suffix[suffix.length - 1];
        const imgName = `img_${moduleData.id}_${index}_${idx}.${suffix}`;
        const imgPathItem = `${imgPath}/${imgName}`;
        let curImgObj = {};
        for (const item of imgObj) {
          if (item.imgUrl === imgArr[idx]) {
            curImgObj = item;
          }
        }
        const reg = new RegExp(imgArr[idx], 'g');
        if (!curImgObj.imgPath) {
          await downloadImg(imgArr[idx], imgPathItem);
          let newImgUrl = '';
          if (option.config && option.config.uploadUrl !== '') {
            const udata = await uploadData(
              imgPathItem,
              `imgcook-cli/${temporaryImages}/`,
              option.config
            );
            fileValue = fileValue.replace(reg, udata.url);
            newImgUrl = udata.url;
          } else if (
            moduleData &&
            moduleData.dsl === 'react-taobao-standard'
          ) {
            // 如果在 react 标准下引用本地路径图片，使用 require 引用
            const regex = new RegExp(`"${imgArr[idx]}"`, 'g');
            fileValue = fileValue.replace(
              regex,
              `require('./images/${imgName}')`
            );
          } else {
            fileValue = fileValue.replace(reg, `./images/${imgName}`);
          }
          imgObj.push({
            newImgUrl,
            imgUrl: imgArr[idx],
            imgPath: `./images/${imgName}`
          });
        } else {
          if (option.config && option.config.uploadUrl !== '') {
            fileValue = fileValue.replace(reg, curImgObj.newImgUrl);
          } else {
            fileValue = fileValue.replace(reg, curImgObj.imgPath);
          }
        }
      }
      if (imgObj.length > 0) {
        fs.writeFileSync(imgrc, JSON.stringify(imgObj), 'utf8');
      }
    }
    item.panelValue = fileValue;
    index++;
  }
  return data;
};

module.exports = (...args) => {
  return loader(...args).catch(err => {
    console.log(chalk.red(err));
  });
};
