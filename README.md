# ApeSwap Governance
Build Solidity smart contracts with truffle, openzeppelin and typescript support.

## Install 
Click "Use as Template" to create a repo on GitHub based on this repo. Otherwise:  
`git clone git@github.com:DeFiFoFum/truffle-typescript-template.git`   
  
`yarn install`

## Setup
Create a `.env` file based off of `.env.example` to deploy contracts to bsc mainnet/testnet and to verify deployed contracts.  

</br>

## Package Install 
This repo also provides a helper module for interacting with the ApeSwap Governance contracts with node via a front-end or back-end framework.  

`yarn add @apeswapfinance/governance`  

As this package is hosted via GitHub's package management service, please create a `.npmrc` file at the root of your project and add the lines below. You will need to create a [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and export it via `export=<NPM_TOKEN>`.  

```bash
@apeswapfinance:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

## Development
Start a local development blockchain by running the following command:  
`yarn ganache`  
  
Deploy contracts to the development blockchain:  
`yarn migrate:dev` 

## Compile
`yarn compile`

</br>

## Deploy 

### Mainnet
`yarn migrate:bsc [--reset]` // Use `--reset` to redeploy already deployed contracts   
`yarn verify:bsc`  

### Testnet
`yarn migrate:testnet [--reset]`  
`yarn verify:testnet`  
  
_* new contracts that are created must be added to the verification script in package.json by adding `&&` to the end with the new contract verification._


## Lint
Lint with `solhint`  
`yarn lint` / `yarn lint:fix`    

</br>

## Test
Tests are run with `@openzeppelin` test environment. This allows tests to be run independently of an external development blockchain.   

Test the project with `yarn test`   

Tests are using  
`@openzeppelin/test-helpers`  
`@openzeppelin/test-environment` 

</br>

### Solidity Doc Gen
`yarn gen:docs`
[solidity-docgen](https://github.com/OpenZeppelin/solidity-docgen) can be used in this repo to scrape [NatSpec](https://docs.soliditylang.org/en/latest/natspec-format.html) comments into markdown files for easy document generation.  

_This module uses the solc package to generate the documents. If the compiler is changed, ensure that the correct solc version is installed: `yarn add solc@0.8.7`_

</br>

### Solidity Coverage
[solidity-coverage](https://www.npmjs.com/package/solidity-coverage) is used in this repo to provide an output of the test coverage after running tests.

### Automated Tests
The OpenZeppelin test environment coupled with Github actions facilitates automated contract tests on pushes to GitHub! 

</br>

## Generate Types from Contracts
Use `typechain` to generate contract interfaces for UI integration.  
`yarn gen:types`  

## Contract Size 
Use the `truffle-contract-size` module to find the size of each contract in the `contracts/` directory with:  
`yarn size`  

## Usage
Provided below is an example of importing the and using the provided library to encode a batch timelock tx.

```js
import { TimelockLib } from '@apeswapfinance/governance';
const timelockEncoder = new TimelockLib.TimelockEncoder();


async function encodeMessageTx(message: string, { address = ADDRESS_0 }): Promise<PopulatedTransaction> {
    const messageBoardContract = new Contract(address, MessageBoardBuild.abi) as MessageBoard;
    const populatedTx = await messageBoardContract.populateTransaction.addMessage(message);
    return populatedTx;
}

async function encodeBatchTimelockMessageTx(messages: string[], { timelockAddress = ADDRESS_0, messageBoardAddress = ADDRESS_0, predecessor = BYTES_32_0, salt = BYTES_32_0, delay = 20 }): Promise<BatchEncodeReturn> {
    const timelockEncoder = new TimelockEncoder(timelockAddress);

    const targets: string[] = [];
    const datas: string[] = [];
    const values: string[] = [];
    for (const message of messages) {
        const populatedTx = await encodeMessageTx(message, { address: messageBoardAddress });
        targets.push(populatedTx.to || '0x');
        datas.push(populatedTx.data || '0x');
        values.push('0');
    }

    return await timelockEncoder.encodeTxsForBatchOperation({ targets, values, datas, predecessor, salt }, delay);
};
```

## Architecture
The preliminary design is as follows: 
<img src="images/apeswap-dao-wip.png">
