#!/usr/bin/env node
const semver = require('semver');
const chalk = require('chalk');

// Review Node Version
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

// Version
program.version(pkg.version, '-v, --version').usage('<command> [options]');

// Config
// node bin/imgcook.js config <value>
program
  .command('config [value]')
  .description('Inspect and modify the imgcook config')
  .option('--get <path>', 'Get value from option')
  .option('--set <path> <value>', 'Set option value')
  .option('--json', 'Outputs JSON result only')
  .option('--file <path>','Input file Path')
  .allowUnknownOption()
  .action(async (value, cmd) => {
    require('../lib/config')(value, minimist(process.argv.slice(3)));
  });

program
  .command('install [value]')
  .description('Install plugin')
  .option('-n, --name <name>', 'plugin name')
  .allowUnknownOption()
  .action(async (value, cmd) => {
    require('../lib/install')(value, cmd);
  });

// pull module code
// node bin/imgcook.js pull 1 --path ./test
program
  .command('pull <moduleid>')
  .description('Pull module code from imgcook')
  .option('-p, --path <path>', 'Absolute or relative path')
  .option(
    '-a, --app',
    'Pull module into `mod` folder while your are in imgcook app project'
  )
  .option(
    '-o, --output <type>',
    'The output type, available values are: source and json',
    'source'
  )
  .allowUnknownOption()
  .action(async (value, cmd) => {
    require('../lib/pull')(value, cmd);
  });

program
  .command('init')
  .description('generate a new project from a template')
  .allowUnknownOption()
  .action(async (value, cmd) => {
    require('../lib/init')(value, cmd);
  });

  program
  .command('update')
  .description('update imgcook cli')
  .allowUnknownOption()
  .action(async (value, cmd) => {
    require('../lib/update')(value, cmd);
  });

// Output help information on unknown commands
program.arguments('<command>').action(cmd => {
  program.outputHelp();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  console.log();
});

// Add some useful info on help
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
