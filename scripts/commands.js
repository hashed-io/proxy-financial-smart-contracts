const { contracts, publicKeys, owner, chain, sleep, isLocalNode } = require('./config')
const { compileContract } = require('./compile')
const { createAccount, deployContract } = require('./deploy')
const { accountExists, contractRunningSameCode } = require('./eosio-errors')
const { setParamsValue } = require('./contract-settings')
const { updatePermissions } = require('./permissions')
const prompt = require('prompt-sync')()

const { warnings, errors, success, start, finish, flag } = require('./ui')


async function manageDeployment(contract) {
  console.log('create account:', contract.nameOnChain)
  try {
    await createAccount({
      account: contract.nameOnChain,
      publicKey: publicKeys.active,
      stakes: contract.stakes,
      creator: owner
    })
  } catch (err) {
    accountExists(err)
  }
  start('deploy contract for: ' + contract.nameOnChain)
  try {
    await deployContract(contract)
  } catch (err) {
    contractRunningSameCode(err)
  }
  finish('done')
}

async function init() {

  // compile contracts
  start('COMPILING CONTRACTS')

  await Promise.all(contracts.map(contract => {
    return compileContract({
      contract: contract.name,
      path: `./src/${contract.name}.cpp`
    })
  }))

  success('compilation finished')

  // deploy contracts
  start('DEPLOYING CONTRACTS')

  for (const contract of contracts) {
    await manageDeployment(contract)
    await sleep(1000)
  }

  success('deployment finished')

  start('UPDATE PERMISSIONS')
  await updatePermissions()
  success('update permissions finished')

  finish('nice');

}

async function run(contractName) {

  let contract = contracts.filter(c => c.name == contractName)
  if (contract.length > 0) {
    contract = contract[0]
  } else {
    errors('contract not found')
    return
  }

  await compileContract({
    contract: contract.name,
    path: `./src/${contract.name}.cpp`
  })

  await manageDeployment(contract)

}

async function compile() {

  // compile contracts
  start('COMPILING CONTRACTS')

  await Promise.all(contracts.map(contract => {
    return compileContract({
      contract: contract.name,
      path: `./src/${contract.name}.cpp`
    })
  }))

  finish('compilation finished')

}


async function compile_contract(contractName) {

  let contract = contracts.filter(c => c.name == contractName)
  if (contract.length > 0) {
    contract = contract[0]
  } else {
    errors('contract not found')
    return
  }

  await compileContract({
    contract: contract.name,
    path: `./src/${contract.name}.cpp`
  })

  success(`${contract.name} compiled successfully!`)

}

async function main() {

  if (!isLocalNode()) {
    const option = prompt(`You are about to run a command on ${chain}, are you sure? [y/n] `)
    if (option.toLowerCase() !== 'y') { return }
  }

  const args = process.argv.slice(2)

  switch (args[0]) {

    case 'init':
      await init()
      break;

    case 'compile':
      if (args.length == 1) {
        await compile()

      } else {

        await compile_contract(args[1])
      }
      break;

    case 'run':
      await run(args[1])
      break;

    case 'set':
      if (args[1] == 'params') {
        await setParamsValue()

      } else if (args[1] == 'permissions') {
        console.log('UPDATE PERMISSIONS')
        await updatePermissions()
        console.log('update permissions finished')

      } else {
        console.log('Invalid input')
      }
      break;

    default:
      console.log('Invalid input.')
  }

}

// main()

module.exports = {
  init,
  compile,
  compile_contract,
  run,
  setParamsValue,
  updatePermissions,
  manageDeployment

}