// TODO: Declaration files from TypeChain are not being copied over to build
export * from './lib'
export * as ContractTypes from './types/ethers-contracts/'

import MasterApe from './build-apeswap/contracts/MasterApe.json'
import MasterApeAdmin from './build-apeswap/contracts/MasterApe.json'
import AccessControl from './build/contracts/AccessControl.json'
import Timelock from './build/contracts/Timelock.json'

const ContractArtifacts = {
    MasterApe,
    MasterApeAdmin,
    AccessControl,
    Timelock,
}

export { ContractArtifacts };
