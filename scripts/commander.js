#!/usr/bin/env node

const { contracts } = require('./config')

const program = require('commander')

const { init, compile, compile_contract, run, setParamsValue, updatePermissions } = require('./commands')
const test = require('./test')

const batchCallFunc = async (contract, moreContracts, func) => {

  if (contract != 'all') {
    await func(contract);

    if (moreContracts.length) {
      for (var i = 0; i < moreContracts.length; i++) {
        await func(moreContracts[i]);
      }
    }

  } else {
    for (var i = 0; i < contracts.length; i++) {
      await func(contracts[i].name);
    }

  }

}

program
  .command('init')
  .description('Compile, deploy and manage permissions for the smart contracts')
  .action(async function () {
    await init();
  })
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ ./scripts/program.js init');
  });

program
  .command('compile <contract> [moreContracts...]')
  .description('Compile custom contract')
  .action(async function (contract, moreContracts) {
    await batchCallFunc(contract, moreContracts, compile_contract)
  })
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ ./scripts/program.js compile calculator');
  });

program
  .command('run <contract> [moreContracts...]')
  .description('Compile and deploy custom contract')
  .action(async function (contract, moreContracts) {
    await batchCallFunc(contract, moreContracts, run)
  })
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ ./scripts/program.js run calculator');
  });

program
  .command('test <contract> [moreContracts...]')
  .description('Test custom contract')
  .action(async function (contract, moreContracts) {
    await batchCallFunc(contract, moreContracts, test)
  })
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ ./scripts/program.js test calculator');
  });

program.parse(process.argv)

var NO_COMMAND_SPECIFIED = program.args.length === 0;
if (NO_COMMAND_SPECIFIED) {
  program.help();
}