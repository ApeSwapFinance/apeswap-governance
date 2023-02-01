// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.17;

/*
  ______                     ______                                 
 /      \                   /      \                                
|  ▓▓▓▓▓▓\ ______   ______ |  ▓▓▓▓▓▓\__   __   __  ______   ______  
| ▓▓__| ▓▓/      \ /      \| ▓▓___\▓▓  \ |  \ |  \|      \ /      \ 
| ▓▓    ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\\▓▓    \| ▓▓ | ▓▓ | ▓▓ \▓▓▓▓▓▓\  ▓▓▓▓▓▓\
| ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓    ▓▓_\▓▓▓▓▓▓\ ▓▓ | ▓▓ | ▓▓/      ▓▓ ▓▓  | ▓▓
| ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓▓▓▓▓▓▓  \__| ▓▓ ▓▓_/ ▓▓_/ ▓▓  ▓▓▓▓▓▓▓ ▓▓__/ ▓▓
| ▓▓  | ▓▓ ▓▓    ▓▓\▓▓     \\▓▓    ▓▓\▓▓   ▓▓   ▓▓\▓▓    ▓▓ ▓▓    ▓▓
 \▓▓   \▓▓ ▓▓▓▓▓▓▓  \▓▓▓▓▓▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓\▓▓▓▓  \▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓ 
         | ▓▓                                             | ▓▓      
         | ▓▓                                             | ▓▓      
          \▓▓                                              \▓▓         
 * App:             https://ApeSwap.finance
 * Medium:          https://ape-swap.medium.com
 * Twitter:         https://twitter.com/ape_swap
 * Telegram:        https://t.me/ape_swap
 * Announcements:   https://t.me/ape_swap_news
 * Reddit:          https://reddit.com/r/ApeSwap
 * Instagram:       https://instagram.com/ApeSwap.finance
 * GitHub:          https://github.com/ApeSwapFinance
 */

import "./xGNANA.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

/**
    // TODO: Possible features
    - [x] AccessControl to be able to whitelist IERC20VotesDelegatee from factory contracts
    - [ ] Factory contract which can deploy bribe contracts with the callback functions below 
    - [ ] Relevant events
    - [ ] NatSpec comments
    - [ ] Some ability to accumulate non GNANA revenue
          - I would say that my argument still applies that we should perform buy backs at strategic points when there is high value
             Is there a way we could mix in like stable revenue and with GNANA for xGNANA holders? 

    - [x] Provide an admin role to be able to add new white listers
    - [x] Be able to remove delegatee contracts
 */

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
interface IERC20VotesDelegatee is IERC165 {
    function syncDelegatePower(address delegator) external;
}

/**
 * The intent here is that a factory contract could be used to deploy bridge contracts
 * where a protocol can fill up with tokens and distribute tokens to xGNANA holders who 
 * delegate their voting power.
 */
interface IxTokenWithBribes {
    event CallbackDelegateRegistered(IERC20VotesDelegatee indexed delegatee);
    event CallbackDelegateRemoved(IERC20VotesDelegatee indexed delegatee);
    function syncDelegateVotingPower(address delegator, address delegatee, bool withRevert) external;
    function registerCallbackDelegatee(IERC20VotesDelegatee delegateeContract) external;
    function removeCallbackDelegatee(IERC20VotesDelegatee delegateeContract) external;
    function getVotesDelegatedTo(address delegator, address delegatee) external returns (uint256);
}

contract xGNANABribes is IxTokenWithBribes, xGNANA, AccessControlEnumerable {
    // NOTE: example https://github.com/ApeSwapFinance/apeswap-pool-factory/blob/f24fb874a9f70cedcfadeecd4a6ddacb45ee9752/contracts/PoolManager.sol
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _registeredCallbackDelegatees;

    bytes32 public constant DELEGATEE_MANAGER_ROLE = keccak256("DELEGATEE_MANAGER_ROLE");
    
    constructor(ERC20 gnana_, address admin_) xGNANA(gnana_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _setRoleAdmin(DELEGATEE_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    function syncDelegateVotingPower(address delegator, address delegatee, bool withRevert) public {
        bool synced = _syncDelegateVotingPower(delegator, delegatee);
        if(withRevert && !synced) {
            revert("delegatee not registered");
        }
    }

    function getRegisteredCallbackDelegateesCount() external view returns (uint256) {
        return _registeredCallbackDelegatees.length();
    }

    function getRegisteredCallbackDelegateesAt(uint256 index) external view returns (address) {
        return _registeredCallbackDelegatees.at(index);
    }
    
    function getAllRegisteredCallbackDelegatees() external view returns (address[] memory) {
        return _registeredCallbackDelegatees.values();
    }

    function registerCallbackDelegatee(IERC20VotesDelegatee callbackDelegatee) external override onlyRole(DELEGATEE_MANAGER_ROLE) {
        require(callbackDelegatee.supportsInterface(type(IERC20VotesDelegatee).interfaceId), "Does not support interface");
        if(!_registeredCallbackDelegatees.contains(address(callbackDelegatee))) {
            _registeredCallbackDelegatees.add(address(callbackDelegatee));
            emit CallbackDelegateRegistered(callbackDelegatee);
        }
    }

    function removeCallbackDelegatee(IERC20VotesDelegatee callbackDelegatee) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_registeredCallbackDelegatees.contains(address(callbackDelegatee)), "not registered");
        _registeredCallbackDelegatees.remove(address(callbackDelegatee));
        emit CallbackDelegateRemoved(callbackDelegatee);
    }

    function getVotesDelegatedTo(address delegator, address delegatee) external view override returns (uint256) {
        address currentDelegatee = delegates(delegator);
        if(currentDelegatee == delegatee) {
            return balanceOf(delegator);
        } else {
            return 0;
        }
    }

    /**
     * @dev This hook is called after _mint and _burn even though
     *  xGNANA is non-transferrable
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(xGNANA) {
        super._afterTokenTransfer(from, to, amount);
        // After balances are updated, sync external 
        _syncDelegateVotingPower(delegates(from), from);
        _syncDelegateVotingPower(delegates(to), to);
    }

    /**
     * @dev Change delegation for `delegator` to `delegatee`.
     *
     * Sync delegation power with external delegation contract for bribes.
     */
    function _delegate(address delegator, address delegatee) internal override(ERC20Votes) {
        address fromDelegate = delegates(delegator);
        super._delegate(delegator, delegatee);

        _syncDelegateVotingPower(fromDelegate, delegator);
        _syncDelegateVotingPower(delegatee, delegator);
    }

    function _syncDelegateVotingPower(address delegator, address delegatee) internal returns (bool){
        if(_registeredCallbackDelegatees.contains(delegatee)) {
            IERC20VotesDelegatee(delegatee).syncDelegatePower(delegator);
            return true;
        } else {
            return false;
        }
    }
}