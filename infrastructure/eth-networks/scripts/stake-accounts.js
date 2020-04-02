const fs = require('fs');
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

// ETH host info
const ethUrl = 'https://ropsten.infura.io/v3/59fb36a36fa4474b890c13dd30038be5';
const ethNetworkId = '3';

// Contract owner info
const contractOwnerAddress = '0x923C5Dbf353e99394A21Aa7B67F3327Ca111C67D';
const contractOwnerProvider = new HDWalletProvider(process.env.CONTRACT_OWNER_ETH_ACCOUNT_PRIVATE_KEY, ethUrl);
const authorizer = contractOwnerAddress

// We override transactionConfirmationBlocks and transactionBlockTimeout because they're
// 25 and 50 blocks respectively at default.  The result of this on small private testnets
// is long wait times for scripts to execute.
const web3_options = {
    defaultBlock: 'latest',
    defaultGas: 4712388,
    transactionBlockTimeout: 25,
    transactionConfirmationBlocks: 3,
    transactionPollingTimeout: 480
};

// We use the contractOwner for all web3 calls except those where the operator address is
// required.
const web3 = new Web3(contractOwnerProvider, null, web3_options);

const operatorAddresses = [
  '0x1833a1a046db585d9c405ad93bfce085d43b2b04',
  '0xb4f78caa0ad8c8c700eaac42b68e5db4f9efeddf',
  '0x9f778b5d9b6e598e5a9dfb789500f6cf20e3203e',
  '0xc2f4c01a446f199fce344df1167c92650651f9c0',
  '0x32ce883e94ea3a75063e47064c777839aa4a0c94',
  '0xca8754f7060a0648824f274e3a4d897fa497139d',
  '0x8e258d2299bc1ee92ec9e70efb381d9b7c70c3d7',
  '0x5c769c2a379ebd630aa8ac9f125176209f170e6d'
];

const contractDir = '../keep-test/ropsten'

// Each <contract.json> file is sourced directly from the InitContainer.  Files are generated by
// Truffle during contract and copied to the InitContainer image via Circle.
// TokenStaking
const tokenStakingContractJsonFile = `${contractDir}/TokenStaking.json`;
const tokenStakingContractParsed = JSON.parse(fs.readFileSync(tokenStakingContractJsonFile));
const tokenStakingContractAbi = tokenStakingContractParsed.abi;
const tokenStakingContractAddress = tokenStakingContractParsed.networks[ethNetworkId].address;
const tokenStakingContract = new web3.eth.Contract(tokenStakingContractAbi, tokenStakingContractAddress);

// KeepToken
const keepTokenContractJsonFile = `${contractDir}/KeepToken.json`;
const keepTokenContractParsed = JSON.parse(fs.readFileSync(keepTokenContractJsonFile));
const keepTokenContractAbi = keepTokenContractParsed.abi;
const keepTokenContractAddress = keepTokenContractParsed.networks[ethNetworkId].address;
const keepTokenContract = new web3.eth.Contract(keepTokenContractAbi, keepTokenContractAddress);

// KeepRandomBeaconOperator
const keepRandomBeaconOperatorContractJsonFile = `${contractDir}/KeepRandomBeaconOperator.json`;
const keepRandomBeaconOperatorContractParsed = JSON.parse(fs.readFileSync(keepRandomBeaconOperatorContractJsonFile));
const keepRandomBeaconOperatorContractAddress = keepRandomBeaconOperatorContractParsed.networks[ethNetworkId].address;

async function provisionOperatorAccount(operatorAddress, contractOwnerAddress, authorizer) {
  await stakeOperatorAccount(operatorAddress, contractOwnerAddress)
  await authorizeOperatorContract(operatorAddress, authorizer)
}

async function stakeOperatorAccount(operatorAddress, contractOwnerAddress) {

  let delegation = '0x' + Buffer.concat([
    Buffer.from(contractOwnerAddress.substr(2), 'hex'),
    Buffer.from(operatorAddress.substr(2), 'hex'),
    Buffer.from(contractOwnerAddress.substr(2), 'hex') // authorizer
  ]).toString('hex');;

  console.log(`Staking 20000000 KEEP tokens on operator account ${operatorAddress}`);

  // Current minimumStake value configured on the TokenStaking contract.
  let stakeAmount = web3.utils.numberToHex('20000000000000000000000000')

  await keepTokenContract.methods.approveAndCall(
    tokenStakingContract.address,
    stakeAmount,
    delegation).send({from: contractOwnerAddress});

  console.log(`Account ${operatorAddress} staked!`);
};

async function authorizeOperatorContract(operatorAddress, authorizer) {

  console.log(`Authorizing Operator Contract ${keepRandomBeaconOperatorContractAddress} for operator account ${operatorAddress}`);

  await tokenStakingContract.methods.authorizeOperatorContract(
    operatorAddress,
    keepRandomBeaconOperatorContractAddress).send({from: authorizer});

  console.log(`Account ${operatorAddress} Authorized!`);
};

operatorAddresses.forEach(operatorAddress => {
  provisionOperatorAccount(operatorAddress, contractOwnerAddress, authorizer).catch(error => {
    console.error(error);
    process.exit(1);
  })
});
