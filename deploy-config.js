// To import
// const { getDeployConfig } = require("../deploy-config");

function getDeployConfig(network, accounts) {
    if (["bsc", "bsc-fork"].includes(network)) {
        console.log(`Deploying with BSC MAINNET config.`)
        return {
            minDelay: 10,
            admin: '0x50Cf6cdE8f63316b2BD6AACd0F5581aEf5dD235D',
            // NOTE: admin is added to these in migration script
            additionalProposers: [],
            additionalExecutors: [],
        }
    } else if (['bsc-testnet', 'bsc-testnet-fork'].includes(network)) {
        console.log(`Deploying with BSC testnet config.`)
        return {
            minDelay: 10,
            admin: '0x',
            // NOTE: admin is added to these in migration script
            additionalProposers: ['0x2BFbf507c9675BD7B461360959D310C3F29870f7'],
            additionalExecutors: ['0x217fc61a5e1E142205E8025aFFaaD46fE02f7ee4'],
        }
    } else if (['development'].includes(network)) {
        console.log(`Deploying with development config.`)
        return {
            minDelay: 10,
            admin: '0x50Cf6cdE8f63316b2BD6AACd0F5581aEf5dD235D', // TODO: Mainnet admin
            // NOTE: admin is added to these in migration script
            additionalProposers: ['0x2BFbf507c9675BD7B461360959D310C3F29870f7'],
            additionalExecutors: ['0x217fc61a5e1E142205E8025aFFaaD46fE02f7ee4'],
        }
    } else {
        throw new Error(`No config found for network ${network}.`)
    }
}

module.exports = { getDeployConfig };
