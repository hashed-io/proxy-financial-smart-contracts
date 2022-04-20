require('dotenv').config()

const contract = (name, nameOnChain) => {
  return {
    name,
    nameOnChain,
    type: 'contract',
    stakes: {
      cpu: '40.0000 TLOS',
      net: '40.0000 TLOS',
      ram: 1000000
    }
  }
}

const devKey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
const devTelosKey = 'EOS5xJJHkqsadnLb6P2fhFmd8e9aJXfBbhmuVJvQrcV2Nu3p5Edx5'

const supportedChains = {
  local: 'local',
  telosTestnet: 'telosTestnet',
  telosMainnet: 'telosMainnet'
}

const ownerByChain = {
  [supportedChains.local]: 'eosio',
  [supportedChains.telosTestnet]: 'llcdaomowner',
  [supportedChains.telosMainnet]: 'tlalocman.sh'
}

const ownerPublicKeysByChain = {
  [supportedChains.local]: {
    owner: devKey,
    active: devKey
  },
  [supportedChains.telosTestnet]: {
    owner: devTelosKey,
    active: devTelosKey
  },
  [supportedChains.telosMainnet]: {

  }
}

const publicKeysByChain = {
  [supportedChains.local]: {
    owner: devKey,
    active: devKey
  },
  [supportedChains.telosTestnet]: {
    owner: devTelosKey,
    active: devTelosKey
  },
  [supportedChains.telosMainnet]: {

  }
}

const contractsConfig = {
  [supportedChains.local]: [
    contract('accounts', 'proxyact'),
    contract('budgets', 'proxybud'),
    contract('permissions', 'proxyperm'),
    contract('projects', 'proxyprj'),
    contract('transactions', 'proxytrx')

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
    contract('accounts', 'proxyv1accnt'),
    contract('budgets', 'proxyv1bdgts'),
    contract('permissions', 'proxyv1prmss'),
    contract('projects', 'proxyv1prjct'),
    contract('transactions', 'proxyv1trnsc')
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
  { // permissions for budgets
    target: `${contractNames.budgets}@active`,
    actor: `${contractNames.budgets}@eosio.code`
  },
  {
    target: `${contractNames.budgets}@active`,
    actor: `${contractNames.accounts}@active`
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
  { // permissions for projects
    target: `${contractNames.projects}@active`,
    actor: `${contractNames.projects}@eosio.code`
  },
  { // permissions for transactions
    target: `${contractNames.transactions}@active`,
    actor: `${contractNames.transactions}@eosio.code`
  },
  {
    target: `${contractNames.transactions}@active`,
    actor: `${contractNames.projects}@active`
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
