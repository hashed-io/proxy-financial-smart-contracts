require('dotenv').config()

const { networksNames } = require('./helper')

const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)


async function deployScript () {

    let cmd

    if (process.env.EOSIO_NETWORK === networksNames.local) {
        cmd = 'eoslime deploy --path="./scripts/deploy/"'
    } else if (process.env.EOSIO_NETWORK === networksNames.telosTestnet) {
        cmd = 'eoslime deploy --path="./scripts/deploy/" --network.url="https://testnet.telos.caleos.io" --network.chainId="1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f"'
    }

    console.log('Running command: ')
    console.log(cmd)

    const output = await execAsync(cmd)
    console.log(output.stdout)
}

deployScript()

