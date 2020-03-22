require('dotenv').config()

const { networksNames, names, accounts } = require('./helper')

const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

const getLine = (function () {
    const getLineGen = (async function* () {
        for await (const line of readline) {
            yield line;
        }
    })()
    return async () => ((await getLineGen.next()).value);
})()


async function getReset () {

    console.log('Do you want to reset all the contracts? [yes/no] ')
    let opt = await getLine()
    let reset = ''

    opt = opt.toLocaleLowerCase()

    if (opt.length > 0 && 'yes'.includes(opt) && opt.length < 4) {
        reset = ' --reset'
    }

    return reset 

}



async function deployScript () {

    try {
        
        let cmd
        let reset = await getReset()
        
        if (process.env.EOSIO_NETWORK === networksNames.local) {        
            
            cmd = 'eoslime deploy --path="./scripts/deploy/"'
            
        } else if (process.env.EOSIO_NETWORK === networksNames.telosTestnet) {
            
            cmd = 'eoslime deploy --path="./scripts/deploy/" --network.url="https://testnet.telos.caleos.io" --network.chainId="1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f"'
            
        }
        
        cmd += reset
        
        console.log('Running command: ')
        console.log(cmd)
        
        const output = await execAsync(cmd)
        console.log(output.stdout)
        return process.exit(0)
    } catch (error) {
        console.log(error)        
    }
}

deployScript()

