const fs = require('fs');
const request = require('request');

exports.downloadImg = (url, lurl) => {
  return new Promise(resolve => {
    request(url)
      .pipe(fs.createWriteStream(lurl))
      .on('close', () => {
        resolve();
      });
  });
};