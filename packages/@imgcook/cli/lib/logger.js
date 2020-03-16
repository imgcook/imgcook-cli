const fs = require('fs-extra');
var moment = require('moment');
const { cliConfig } = require('./helper');

function log(options) {
  const { message, type } = options;
  const time = new Date();
  const year = time.getFullYear();
  const month =
    time.getMonth() + 1 > 9 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`;
  const day = time.getDay() > 9 ? time.getDay() : `0${time.getDay()}`;
  const logFileName = `cli.log.${year}-${month}-${day}`;
  const input =
    moment().format('YYYY-MM-DD h:mm:ss,SSS') + ` ${type} ` + message + '\n';
  fs.appendFile(`${cliConfig.path}/${logFileName}`, input, err => {
    // if(!err) console.log();
  });
}
function info(message) {
  log({ message, type: 'INFO' });
}
function warn(message) {
  log({ message, type: 'WARN' });
}
function error(message) {
  log({ message, type: 'ERROR' });
}
module.exports = {
  info,
  warn,
  error
};
