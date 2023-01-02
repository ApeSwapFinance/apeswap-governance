interface AddressList {
    OZ_TIMELOCK_ALPHA: string;
    OZ_TIMELOCK_BRAVO: string;
    GENERAL_ADMIN_EOA: string;
    MASTER_APE_DUMMY: string;
    MASTER_APE_ADMIN_DUMMY: string;
    MASTER_APE_V2_DUMMY: string;
    MASTER_APE_ADMIN_V2_DUMMY: string;
    MESSAGE_BOARD: string;
}

export const addressList: Record<number, AddressList> = {
    56: {
        OZ_TIMELOCK_ALPHA: '0xED1EE002970805Cd8b0270BEA58907327e867f29',
        OZ_TIMELOCK_BRAVO: '0x3c873C63dA3160f9ea58a8cBD5283C29300DC6d9',
        GENERAL_ADMIN_EOA: '0x6c905b4108A87499CEd1E0498721F2B831c6Ab13',
        MASTER_APE_DUMMY: '0x7C2d70FC900b289A82428f47da2504428Fc92dcB',
        MASTER_APE_ADMIN_DUMMY: '0x5458ce70A7ef85f46Fa4b2503DD25b03AA85B60b',
        MASTER_APE_V2_DUMMY: '0x63d2495050309b0639d24C870f1c3BA4e88F4626',
        MASTER_APE_ADMIN_V2_DUMMY: '0xA1cD8C9E143b739Eb01CDe388aF84E2C65DD476C',
        MESSAGE_BOARD: '0x968697b58a792ac43c43D7F6997F1044De38ddE8',
    }
}