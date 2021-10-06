# Master Ape Admin

## Migration to MasterApeAdmin from production MasterApe

Start: Timelock -> MasterApe  
End:   
Timelock A (Owner) ->   
Timelock B (Farm Admin) -> MasterApeAdmin -> MasterApe  
 
### **Disclaimer**
This is a VERY risky procedure for a running MasterApe. It could brick the entire platform if the ownership is not transferred properly. 

## Steps

1. Deploy `Timelock A` and `Timelock B`. The owner of these should be a multisig.
2. Deploy `MasterApeAdmin`. Set the `MasterApe` address to the production address and `farmAdmin` to Timelock B
3. Transfer ownership of the contract to `Timelock A`
4. Run some tests on the `MasterApeAdmin`
   1. Verify MasterApe address is correct before starting transfer
5. Schedule the transfer of ownership through the timelock contract. Verify again that: 
    1. You are in control of the `MasterApeAdmin`
    2. The `MasterApeAdmin` points to the correct `MasterApe` address
    3. The ownership is being transferred to the correct `MasterApeAdmin`
6. Execute the timelock to transfer ownership


## Gas Costs through OZ Timelock
Based on mainnet testing, provided below are some examples of making updates and gas costs. Mass updating the pools before updates runs a loop through ALL farms which at some point will cost too much gas. Similar situation with the fixed percentage farms, but it shouldn't be an issue if 5 or less fixed percentage farms are added. If gas is an issue the sync of fixed percentage farms AND pools can be done in separate txs.  

If you need to do a mass pool update then sync separately.

**_EOA -> GSafe -> OZ Timelock -> MasterApeAdmin -> MasterApe_**

**syncFixedPercentFarms**: 659,322 https://bscscan.com/tx/0x937c7487359464bb66fa5f40fa599f8939e933ed775d1d440f7de03b4ef391a5
**addMasterApeFarms(20x, no-sync)**: 6,883,437  https://bscscan.com/tx/0x659b9f5fc4f16a72d90681f220ba4e4f5b95fbb69d02ce4e9a51ee792a84d33b
**setMasterApeFarms(20x, no-sync)**: 2,898,237  https://bscscan.com/tx/0x72b54b478d2cc7194e3caa0605840fcf48aea53f005c5aa443e1db8aed7b79ba
**setMasterApeFarms(20x, sync-fixed-farms, no-pool-sync)**: 4,274,834  https://bscscan.com/tx/0x814c7a86a8ac0dac17c834866d5b20470f279d9be0f8be0ee8514204b6505c17
**setMasterApeFarms(50x, no-sync)**: 9,442,758  https://bscscan.com/tx/0x814c7a86a8ac0dac17c834866d5b20470f279d9be0f8be0ee8514204b6505c17

