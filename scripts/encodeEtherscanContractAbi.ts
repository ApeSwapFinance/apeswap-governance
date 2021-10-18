
import { EtherscanService, getConfig } from 'etherscan-api-typescript-sdk';
import { Contract } from '@ethersproject/contracts'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder from '../lib/timelock/TimelockEncoder';

(async function () {
    try {
        const ADDRESS = '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9' // bsc MasterApe
        const { baseUrl: BASE_URL, apiKey: API_KEY } = getConfig('bsc');
        // Get details from Etherscan service
        const etherscanService = new EtherscanService(BASE_URL, API_KEY);
        const fullContractDetails = await etherscanService.getFullContractDetails(ADDRESS);
        const contractInstance = new Contract(ADDRESS, fullContractDetails.ABI);
        // Encode every function on the ABI with random values
        const encodedTxs = {};
        for (const functionName of fullContractDetails.parsedAbi.functionList) {
            const functionDetails = fullContractDetails.parsedAbi.getFunctionByName(functionName);
            let inputs: Array<number | string | boolean> = [];
            for (const input of functionDetails.inputs) {
                const inputType = input.type;
                // TODO: Can use random values in the future
                if(inputType.includes('uint')) {
                    inputs.push(1)
                } else if(inputType == 'address') {
                    inputs.push('0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9')
                } else if(inputType == 'bool') {
                    inputs.push(true)
                } else {
                    throw new Error(`Input type ${inputType} not recognized.`)
                }
                
            }

            encodedTxs[functionName] = await contractInstance.populateTransaction[functionName](...inputs);
        }

        console.dir({encodedTxs});

        // Encode all txs into a single Timelock batch tx
        let targets: string[] = [];
        let values: string[] = [];
        let datas: string[] = [];
        for (const encodedTxName in encodedTxs) {
            const encodedTx = encodedTxs[encodedTxName];
            targets.push(encodedTx.to);
            values.push('0');
            datas.push(encodedTx.data);
        }

        const timelockAlphaAddress = addressList[56].OZ_TIMELOCK_ALPHA;
        const timelockEncoder = new TimelockEncoder(timelockAlphaAddress);

        const timelockBatchEncoded = await timelockEncoder.encodeTxsForBatchOperation({targets, values, datas}, 20)

        console.dir({timelockBatchEncoded}, {depth: 5});
        
        await Promise.resolve(console.log('🎉'));
        process.exit(0); // Exit Success
    } catch (e) {
        throw new Error(e);
    }
}());