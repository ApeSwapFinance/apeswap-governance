require('dotenv').config();
import { ethers } from 'ethers';

function getEnvOrThrow(key: string) {
    const value = process.env[key];
    if(!value) {
        throw new Error(`Value for env ${key} is not set`);
    }
    return value;
}


export async function getPrivateProvider() {
    return await new ethers.providers.JsonRpcBatchProvider({
        url: getEnvOrThrow('MAINNET_PRIVATE_URL'),
        user: getEnvOrThrow('MAINNET_PRIVATE_USER'),
        password: getEnvOrThrow('MAINNET_PRIVATE_PASSWORD'),
    })

}