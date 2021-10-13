# Timelock Management

## Roles

In the timelock there are three main roles that are used to manage access to the timelock.  

- `TIMELOCK_ADMIN_ROLE`: Super Admin of the `Timelock`. Can add/revoke any role AND act as ANY role. 
- `PROPOSER_ROLE`: Proposers are able to schedule/queue txs to be send from the `Timelock`.
- `EXECUTOR_ROLE`: Executors can execute scheduled/queued txs that have passed their delay period.

**_NOTE: It is possible to remove ALL users of one role. If ALL `TIMELOCK_ADMIN_ROLE` members are removed then the timelock will no longer have an admin and possibly render it useless which means all contracts that are under it will be useless too. Be EXTRA careful when revoking `TIMELOCK_ADMIN_ROLE`s_**

```javascript
// 0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5
bytes32 public constant TIMELOCK_ADMIN_ROLE = keccak256("TIMELOCK_ADMIN_ROLE"); 
// 0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1
bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE"); 
// 0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63
bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE"); 
```

### Add Roles
Only the `TIMELOCK_ADMIN_ROLE` can grant new roles.   
Call `function grantRole(bytes32 role, address account)` from a `TIMELOCK_ADMIN_ROLE` member to add a member to the specified role.


```javascript
// Example: grant PROPOSER_ROLE to burn address (must be called from the TIMELOCK_ADMIN_ROLE)
await timelockContract.grantRole('0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1', '0x000000000000000000000000000000000000dEaD');
```

### Revoke Roles
The `TIMELOCK_ADMIN_ROLE` can revoke any role.  
Call `function revokeRole(bytes32 role, address account)` from a `TIMELOCK_ADMIN_ROLE` member to revoke a member from any specified role.  


```javascript
// Example: revoke PROPOSER_ROLE for burn address (must be called from the TIMELOCK_ADMIN_ROLE)
await timelockContract.revokeRole('0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1', '0x000000000000000000000000000000000000dEaD');
```

Any member can renounce their own role.    
Call `function renounceRole(bytes32 role, address account)` from a member to revoke their own specified role.    


```javascript
// Example: renounce PROPOSER_ROLE to burn address (must be called from same member)
await timelockContract.renounceRole('0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1', '0x000000000000000000000000000000000000dEaD');
```


