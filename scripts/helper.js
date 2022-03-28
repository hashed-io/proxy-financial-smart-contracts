/* import dotenv from 'dotenv'
dotenv.config()

import R from 'ramda'
import ecc from 'eosjs-ecc' */

require('dotenv').config()

const R = require('ramda')
const ecc = require('eosjs-ecc')
const Eos = require('eosjs')

const currency = '2,USD'

const networksNames = {
  local: 'local',
  telosTestnet: 'telosTestnet',
  telosTestnet2: 'telosTestnet2'
}


const networks = {
	local: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
  telosTestnet: '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f',
  telosTestnet2: '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f',
	telosMainnet: '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11'
}

const networkDisplayName = {
	local: 'Local',
  telosTestnet: 'Telos Testnet',
  telosTestnet2: 'Telos Testnet 2',
	telosMainnet: 'Telos Mainnet'
}

const endpoints = {
  local: 'http://127.0.0.1:8888',
  telosTestnet: 'https://testnet.eos.miami',
  telosTestnet2: 'https://testnet.eos.miami',
  telosMainnet: 'https://node.hypha.earth'
}

const ownerAccounts = {
  local: 'owner',
  telosTestnet: 'ownerprxycap',
  telosTestnet2: 'ownerprxycap',
  telosMainnet: 'proxycapital'
}

const {
	EOSIO_NETWORK,
	EOSIO_API_ENDPOINT,
	EOSIO_CHAIN_ID
} = process.env

const chainId = EOSIO_CHAIN_ID || networks[EOSIO_NETWORK] || networks.local
const httpEndpoint = EOSIO_API_ENDPOINT || endpoints[EOSIO_NETWORK] || endpoints.local
const owner = ownerAccounts[EOSIO_NETWORK] || ownerAccounts.local

const netName = EOSIO_NETWORK != undefined ? (networkDisplayName[EOSIO_NETWORK] || "INVALID NETWORK: "+EOSIO_NETWORK) : "Local"
console.log(""+netName)

const publicKeys = {
  [networks.local]: ['EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'],
  [networks.telosMainnet]: ['EOS6H8Xd2iKMa3KEF4JAQLbHAxkQcyrYgWXjrRJMsY5yEr2Ws7DCj', 'EOS6H8Xd2iKMa3KEF4JAQLbHAxkQcyrYgWXjrRJMsY5yEr2Ws7DCj'],
  [networks.telosTestnet]: ['EOS4vExvL4rYEELk6tVBqq5FUTuQ5pqKJ7eJfJbTwSF5he55E7A5N', 'EOS4vExvL4rYEELk6tVBqq5FUTuQ5pqKJ7eJfJbTwSF5he55E7A5N'],
  [networks.telosTestnet2]: ['EOS4vExvL4rYEELk6tVBqq5FUTuQ5pqKJ7eJfJbTwSF5he55E7A5N', 'EOS4vExvL4rYEELk6tVBqq5FUTuQ5pqKJ7eJfJbTwSF5he55E7A5N']
  // NOTE: Testnet seems to use EOS8C9tXuPMkmB6EA7vDgGtzA99k1BN6UxjkGisC1QKpQ6YV7MFqm for onwer and active - verify
}
const [ ownerPublicKey, activePublicKey ] = publicKeys[chainId]

const account = (accountName, quantity = '0.0000 USD', pubkey = activePublicKey) => ({
  type: 'account',
  account: accountName,
  creator: owner,
  publicKey: pubkey,
  stakes: {
    cpu: '1.0000 TLOS',
    net: '1.0000 TLOS',
    ram: 10000
  },
  quantity
})

const contract = (accountName, contractName, quantity = '0.0000 USD') => ({
  ...account(accountName, quantity),
  type: 'contract',
  name: contractName,
  stakes: {
    cpu: '1.0000 TLOS',
    net: '1.0000 TLOS',
    ram: 700000
  }
})

const accountsMetadata = (network) => {
  if (network == networksNames.local) {
    return {
      owner: account(owner),
      firstuser: account('investoruser', '10000000.0000 USD'),
      seconduser: account('builderuser1', '10000000.0000 USD'),
      thirduser: account('proxyadmin11', '5000000.0000 USD'),
      fourthuser: account('investorusr2', '5000000.0000 USD'),
      transactions: contract('proxycaptrnx', 'transactions'),
      projects: contract('proxycapproj', 'projects'),
      accounts: contract('proxycapacct', 'accounts'),
      permissions: contract('proxycapperm', 'permissions'),
      budgets: contract('proxycapbdgt', 'budgets')
    }
  } else if (network == networksNames.telosMainnet) {
    return {
      owner: account(owner),
      firstuser: account('investoruser', '10000000.0000 USD'),
      seconduser: account('builderuser1', '10000000.0000 USD'),
      thirduser: account('proxyadmin11', '5000000.0000 USD'),
      fourthuser: account('investorusr2', '5000000.0000 USD'),
      transactions: contract('proxycaptrnx', 'transactions'),
      projects: contract('proxycapproj', 'projects'),
      accounts: contract('proxycapacct', 'accounts'),
      permissions: contract('proxycapperm', 'permissions'),
      budgets: contract('proxycapbdgt', 'budgets')
    }
  } else if (network == networksNames.telosTestnet) {
    return {
      owner: account(owner),
      firstuser: account('investoruser', '10000000.0000 USD'),
      seconduser: account('builderuser1', '10000000.0000 USD'),
      thirduser: account('proxyadmin11', '5000000.0000 USD'),
      fourthuser: account('investorusr2', '5000000.0000 USD'),
      transactions: contract('proxycaptrnx', 'transactions'),
      projects: contract('proxycapproj', 'projects'),
      accounts: contract('proxycapacct', 'accounts'),
      permissions: contract('proxycapperm', 'permissions'),
      budgets: contract('proxycapbdgt', 'budgets')
    }
  } else if (network == networksNames.telosTestnet2) {
    return {
      owner: account(owner),
      firstuser: account('investoruser', '10000000.0000 USD'),
      seconduser: account('builderuser1', '10000000.0000 USD'),
      thirduser: account('proxyadmin11', '5000000.0000 USD'),
      fourthuser: account('investorusr2', '5000000.0000 USD'),
      transactions: contract('proxycaptrx1', 'transactions'),
      projects: contract('proxycappro1', 'projects'),
      accounts: contract('proxycapacc1', 'accounts'),
      permissions: contract('proxycapper1', 'permissions'),
      budgets: contract('proxycapbdg1', 'budgets')
    }
  } else {
    throw new Error(`${network} deployment not supported`)
  }
}


const accounts = accountsMetadata(EOSIO_NETWORK)
const names = R.mapObjIndexed((item) => item.account, accounts)

const permissions = [
	{
		target: `${accounts.transactions.account}@active`,
		actor: `${accounts.transactions.account}@eosio.code`
  }, {
		target: `${accounts.projects.account}@active`,
		actor: `${accounts.projects.account}@eosio.code`
  }, {
		target: `${accounts.transactions.account}@active`,
		actor: `${accounts.projects.account}@active`
  }, {
		target: `${accounts.accounts.account}@active`,
		actor: `${accounts.accounts.account}@eosio.code`
  }, {
		target: `${accounts.budgets.account}@active`,
		actor: `${accounts.budgets.account}@eosio.code`
  }, {
		target: `${accounts.accounts.account}@active`,
		actor: `${accounts.projects.account}@active`
  }, {
		target: `${accounts.accounts.account}@active`,
		actor: `${accounts.transactions.account}@active`
  }, {
		target: `${accounts.permissions.account}@active`,
		actor: `${accounts.transactions.account}@active`
  }, {
		target: `${accounts.permissions.account}@active`,
		actor: `${accounts.accounts.account}@active`
  }, {
		target: `${accounts.permissions.account}@active`,
		actor: `${accounts.projects.account}@active`
  }, {
		target: `${accounts.budgets.account}@active`,
		actor: `${accounts.accounts.account}@active`
  }, {
		target: `${accounts.permissions.account}@active`,
		actor: `${accounts.budgets.account}@active`
  }
  
]

const keyProviders = {
  [networks.local]: [process.env.LOCAL_PRIVATE_KEY, process.env.LOCAL_PRIVATE_KEY, process.env.APPLICATION_KEY, process.env.EXECUTE_KEY],
  [networks.telosMainnet]: [process.env.TELOS_MAINNET_OWNER_KEY, process.env.TELOS_MAINNET_ACTIVE_KEY, process.env.APPLICATION_KEY, process.env.EXECUTE_KEY],
  [networks.telosTestnet]: [process.env.TELOS_MAINNET_OWNER_KEY, process.env.TELOS_MAINNET_ACTIVE_KEY, process.env.APPLICATION_KEY, process.env.EXECUTE_KEY],
  [networks.telosTestnet2]: [process.env.TELOS_TESTNET_OWNER_KEY, process.env.TELOS_TESTNET_ACTIVE_KEY, process.env.APPLICATION_KEY, process.env.EXECUTE_KEY]
}

const keyProvider = keyProviders[chainId]

if (keyProvider.length == 0 || keyProvider[0] == null) {
  console.log("ERROR: Invalid Key Provider: "+JSON.stringify(keyProvider, null, 2))
}

const config = {
  keyProvider,
  httpEndpoint,
  chainId
}

const isLocal = () => { return chainId == networks.local }

const createKeypair = async () => {
  let privateK = await ecc.randomKey()
  let publicK = await ecc.privateToPublic(privateK)
  return{ privateK, publicK }
}

const initContracts = (accounts) =>
  Promise.all(
    Object.values(accounts).map(
      account => eos.contract(account)
    )
  ).then(
    contracts => Object.assign({}, ...Object.keys(accounts).map(
      (account, index) => ({
        [account]: contracts[index]
      })
    ))
  )

module.exports = {
  accounts, names, permissions, isLocal, createKeypair, activePublicKey, currency, keyProvider, permissions,
  networksNames
}

