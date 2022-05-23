const { exec } = require('child_process')

const test = (contract) => {
  return new Promise((resolve, reject) => {
    exec(`mocha --timeout 0`, (err, stderr, stdout) => {
      console.error(stderr)
      console.log(stdout)
      resolve()
    })
  })
}

module.exports = test