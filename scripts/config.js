require('dotenv').config()

const contract = (name, nameOnChain) => {
  return {
    name,
    nameOnChain,
    type: 'contract',
    stakes: {
      cpu: '40.0000 TLOS',
      net: '40.0000 TLOS',
      ram: 2400000
    }
  }
}

const devKey = process.env.LOCAL_PUBLIC_KEY

const supportedChains = {
  local: 'local',
  telosTestnet: 'telosTestnet',
  telosMainnet: 'telosMainnet'
}

const ownerByChain = {
  [supportedChains.local]: 'eosio',
  [supportedChains.telosTestnet]: 'proxyadmin11',
  [supportedChains.telosMainnet]: 'tlalocman.sh'
}

const ownerPublicKeysByChain = {
  [supportedChains.local]: {
    owner: process.env.LOCAL_PUBLIC_KEY,
    active: process.env.LOCAL_PUBLIC_KEY
  },
  [supportedChains.telosTestnet]: {
    owner: process.env.TLOSTESTNET_PUBLIC_KEY,
    active: process.env.TLOSTESTNET_PUBLIC_KEY
  },
  [supportedChains.telosMainnet]: {
    owner: process.env.TLOSMAINNET_PUBLIC_KEY,
    active: process.env.TLOSMAINNET_PUBLIC_KEY
  }
}

const publicKeysByChain = {
  [supportedChains.local]: {
    owner: process.env.LOCAL_PUBLIC_KEY,
    active: process.env.LOCAL_PUBLIC_KEY
  },
  [supportedChains.telosTestnet]: {
    owner: process.env.TLOSTESTNET_PUBLIC_KEY,
    active: process.env.TLOSTESTNET_PUBLIC_KEY
  },
  [supportedChains.telosMainnet]: {
    owner: process.env.TLOSMAINNET_PUBLIC_KEY,
    active: process.env.TLOSMAINNET_PUBLIC_KEY
  }
}

const contractsConfig = {
  [supportedChains.local]: [
    contract('nullcontract', 'm1nulldaos'),
    contract('accounts', 'proxyv2accnt'),
    contract('budgets', 'proxyv2bdgts'),
    contract('permissions', 'proxyv2prmss'),
    contract('projects', 'proxyv3prjct'),
    contract('transactions', 'proxyv3trnsc')

  ],
  // THIS CONTRACTS ARE THE ONES ON THE GITLAB
  // [supportedChains.telosTestnet]: [
  //   contract('accounts', 'proxycapacc1'),
  //   contract('budgets', 'proxycapbdg1'),
  //   contract('permissions', 'proxycapper1'),
  //   contract('projects', 'proxycapprox'),
  //   contract('transactions', 'proxycaptrx1')
  // ],
  
  //  NEW ACCOUNTS CREATED
  [supportedChains.telosTestnet]: [
    contract('accounts', 'proxyv2accnt'),
    contract('budgets', 'proxyv2bdgts'),
    contract('permissions', 'proxyv2prmss'),
    contract('projects', 'proxyv3prjct'),
    contract('transactions', 'proxyv3trnsc')
  ],
  [supportedChains.telosMainnet]: [
    contract('accounts', 'pxact.sh'),
    contract('budgets', 'pxbud.sh'),
    contract('permissions', 'pxperm.sh'),
    contract('projects', 'pxprj.sh'),
    contract('transactions', 'pxtrx.sh')
  ]
}

const chain = process.env.CHAIN_NAME

const owner = ownerByChain[chain]
const ownerPublicKeys = ownerPublicKeysByChain[chain]
const publicKeys = publicKeysByChain[chain]

const contracts = contractsConfig[chain]
const contractNames = {}
const nameOnChainToName = {}

for (const c of contracts) {
  contractNames[c.name] = c.nameOnChain
  nameOnChainToName[c.nameOnChain] = c.name
}

const permissionsConfig = [
  { // permissions for accounts
    target: `${contractNames.accounts}@active`,
    actor: `${contractNames.accounts}@eosio.code`
  },
  {
    target: `${contractNames.accounts}@active`,
    actor: `${contractNames.projects}@active`
  },
  {
    target: `${contractNames.accounts}@active`,
    actor: `${contractNames.transactions}@active`
  },
  {
    target: `${contractNames.accounts}@active`,
    actor: `${owner}@active`
  },
  { // permissions for budgets
    target: `${contractNames.budgets}@active`,
    actor: `${contractNames.budgets}@eosio.code`
  },
  {
    target: `${contractNames.budgets}@active`,
    actor: `${contractNames.accounts}@active`
  },
  {
    target: `${contractNames.accounts}@active`,
    actor: `${owner}@active`
  },
  { // for permissions
    target: `${contractNames.permissions}@active`,
    actor: `${contractNames.accounts}@active`
  },
  {
    target: `${contractNames.permissions}@active`,
    actor: `${contractNames.budgets}@active`
  },
  {
    target: `${contractNames.permissions}@active`,
    actor: `${contractNames.projects}@active`
  },
  {
    target: `${contractNames.permissions}@active`,
    actor: `${contractNames.transactions}@active`
  },
  {
    target: `${contractNames.accounts}@active`,
    actor: `${owner}@active`
  },
  { // permissions for projects
    target: `${contractNames.projects}@active`,
    actor: `${contractNames.projects}@eosio.code`
  },
  {
    target: `${contractNames.accounts}@active`,
    actor: `${owner}@active`
  },
  { // permissions for transactions
    target: `${contractNames.transactions}@active`,
    actor: `${contractNames.transactions}@eosio.code`
  },
  {
    target: `${contractNames.transactions}@active`,
    actor: `${contractNames.projects}@active`
  },
  {
    target: `${contractNames.accounts}@active`,
    actor: `${owner}@active`
  }
]

function isLocalNode() {
  return chain == supportedChains.local
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  contracts, contractNames, nameOnChainToName, owner, ownerPublicKeys, publicKeys, isLocalNode, sleep, chain, permissionsConfig,
  devKey
}
