#!/usr/bin/env node
const semver = require('semver');
const chalk = require('chalk');

// 检查Node版本
if (!semver.gte(process.version, '9.0.0')) {
  console.log(
    chalk.red(
      `你使用的node版本${process.version}, ` +
        'imgcook-cli 依赖 node 9.x 或以上版本，请升级本地的 node 环境\n'
    )
  );
  return;
}

const pkg = require('../package.json');
const program = require('commander');
const minimist = require('minimist');

// version
program.version(pkg.version, '-v, --version').usage('<command> [options]');

// config
// node bin/imgcook.js config xx
program
  .command('config [value]')
  .description('inspect and modify the imgcook config')
  .option('--get <path>', 'get value from option')
  .option('--set <path> <value>', 'set option value')
  .option('--json', 'outputs JSON result only')
  .allowUnknownOption()
  .action(async (value, cmd) => {
    require('../lib/config')(value, minimist(process.argv.slice(3)));
  });

// pull module code
// node bin/imgcook.js pull 1 --path ./test
program
  .command('pull <moduleid>')
  .description('pull module code from imgcook')
  .option('-p, --path <path>', 'absolute or relative path')
  .allowUnknownOption()
  .action(async (value, cmd) => {
    require('../lib/pull')(value, cmd);
  });

// output help information on unknown commands
program.arguments('<command>').action(cmd => {
  program.outputHelp();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  console.log();
});

// add some useful info on help
program.on('--help', () => {
  console.log();
  console.log(
    `  Run ${chalk.cyan(
      `imgcook <command> --help`
    )} for detailed usage of given command.`
  );
  console.log();
});

program.parse(process.argv);

// not cmd output help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
