['unique', 'downloadImg', 'homedir'].forEach(i => {
  Object.assign(exports, require(`./lib/${i}`));
});
