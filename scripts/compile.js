require('dotenv').config()

const { exec } = require('child_process')
const { promisify } = require('util')
var fs = require('fs');

const execAsync = promisify(exec)
const mkdirAsync = promisify(fs.mkdir)
const unlinkAsync = promisify(fs.unlink)
const existsAsync = promisify(fs.exists)

const contracts = [
	'projects',
	'accounts',
	'transactions',
	'permissions'
].sort()

const command = ({ contract, source, dir }) => {
	const volume = dir
	let cmd = ''
	if (process.env.COMPILER === 'local') {
		cmd = 'eosio-cpp -abigen -I ./include -contract ' + contract + ' -o ./artifacts/' + contract + '.wasm ' + source
	} else {
		cmd = `docker run --rm --name eosio.cdt_v1.6.1 --volume ${volume}:/project -w /project eostudio/eosio.cdt:v1.6.1 /bin/bash -c "echo 'starting';eosio-cpp -abigen -I ./include -R ./resources -contract ${contract} -o ./artifacts/${contract}.wasm ${source}"`
	}
	console.log('compiler command: ' + cmd)
	return cmd
}

const compile = async ({ contract, source }) => {
	try {

		const contractFound = await existsAsync(source)
		if (!contractFound) {
			throw new Error('contract not found: ' + contract + ' No source file: ' + source)
		}

		const dir = process.cwd() + '/'
		const artifacts = dir + 'artifacts'

		const artifactsFound = await existsAsync(artifacts)
		if (!artifactsFound) {
			console.log('creating artifacts directory...')
			await mkdirAsync(artifacts)
		}

		await deleteIfExists(artifacts + '/' + contract + '.wasm')
		await deleteIfExists(artifacts + '/' + contract + '.abi')

		const execCommand = command({ contract, source, dir })
		await execAsync(execCommand)
		console.log(`${contract} compiled`)
	} catch (error) {
		console.error(`Error compiling ${contract}`, error)
		throw error
	}
}

const deleteIfExists = async (file) => {
	const fileExists = await existsAsync(file)
	if (fileExists) {
		try {
			await unlinkAsync(file)
		} catch (err) {
			console.log('delete file error: ' + err)
		}
	}
}

async function compileAll() {
	for (const contract of contracts) {
		try {
			const promise = compile({
				contract: contract,
				source: `./src/${contract}.cpp`
			})
			if (process.env.COMPILER === 'docker') {
				await promise
			}
		} catch (err) {
			console.log('compile failed for ' + contract + ' error: ' + err)
		}
	}
}


compileAll()
