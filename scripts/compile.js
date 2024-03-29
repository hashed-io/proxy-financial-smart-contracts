const { warnings, errors, success, start, finish, flag } = require('./ui')

require('dotenv').config()

const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const { join } = require('path')

// const existsAsync = promisify(fs.exists)  //not used
// const fse = require('fs-extra')           //not used

const execCommand = promisify(exec)

async function deleteFile (filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

async function compileContract ({
  contract,
  path
}) {

  const compiled = join(__dirname, '../compiled')
  let cmd = ""
  
  if (process.env.COMPILER === 'local') {
    cmd = `eosio-cpp -abigen -I ./include -contract ${contract} -o ./compiled/${contract}.wasm ${path}`
  } else {
    cmd = `docker run --rm --name eosio.cdt_v1.7.0-rc1 --volume ${join(__dirname, '../')}:/project -w /project eostudio/eosio.cdt:v1.7.0-rc1 /bin/bash -c "echo 'starting';eosio-cpp -abigen -I ./include -contract ${contract} -o ./compiled/${contract}.wasm ${path}"`
  }
  start("compiler command: " + cmd)

  if (!fs.existsSync(compiled)) {
    fs.mkdirSync(compiled)
  }

  await deleteFile(join(compiled, `${contract}.wasm`))
  await deleteFile(join(compiled, `${contract}.abi`))

  await execCommand(cmd)

}

module.exports = { compileContract }
