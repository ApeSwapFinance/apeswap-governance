import { writeJSONToFile } from '@defifofum/files'

import { BYTES_32 } from '../lib/constants'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder from '../lib/timelock/TimelockEncoder';
import MasterApeAdminV2Encoder from '../lib/master-ape/MasterApeAdminV2Encoder';

import KeeperMaximizerVaultApeABI from './ABIs/KeeperMaximizerVaultApe.json'
import { Interface } from 'ethers/lib/utils';
import { ethers } from 'ethers';


async function getVaultContractsToWhitelist(
    vaultAddress: string,
    provider: ethers.providers.BaseProvider,
) {
    const vault = new ethers.Contract(vaultAddress, new Interface(KeeperMaximizerVaultApeABI), provider)
    const vaultsLength = (await vault.vaultsLength()).toNumber();

    const vaultAddresses = await Promise.all(
        Array.from(Array(vaultsLength).keys(), (_, index)=> vault.vaults(index))
    );
    const vaultWhitelists = Array.from(Array(vaultsLength).keys(), (_)=> true);

    return { vaultAddresses, vaultWhitelists }
}

(async function () {
    try {
        // Setup
        const salt = BYTES_32(String(Math.floor(Math.random() * 100000) + 1));
        const masterApeAdminV2Address = addressList.bsc.MASTER_APE_ADMIN_V2;
        const masterApeAdminV2Encoder = new MasterApeAdminV2Encoder(masterApeAdminV2Address);
        const timelockGeneral = addressList.bsc.OZ_TIMELOCK_GENERAL;
        const timelockEncoder = new TimelockEncoder(timelockGeneral);
        const TIMELOCK_DELAY = 20;

        // Vault Configuration
        const VAULT_ADDRESS = '0xe5c27cd5981b727d25d37b155abf9aa152ceadbe'
        const PROVIDER_URL = 'https://bsc-dataseed1.binance.org';
        const provider = ethers.getDefaultProvider(PROVIDER_URL);
        const { vaultAddresses, vaultWhitelists } = await getVaultContractsToWhitelist(VAULT_ADDRESS, provider)
        const encodedTx = await masterApeAdminV2Encoder.encodeSetBatchContractWhitelist(vaultAddresses, vaultWhitelists);



        const encodedTimelockTxs = await timelockEncoder.encodeTxsForSingleOperation({ target: masterApeAdminV2Address, data: encodedTx.data || '0x', salt: salt  }, TIMELOCK_DELAY)
        // Write output
        const fileOutput = await writeJSONToFile('./scripts/encodeMasterApeAdminV2BatchWhitelist.json', {encodedTimelockTxs, encodedTx}, true);
        console.log(`Encoded transaction data has been saved to: ${fileOutput}`);

        process.exit(0); // Exit Success
    } catch (e: any) {
        throw new Error(e);
    }
}());