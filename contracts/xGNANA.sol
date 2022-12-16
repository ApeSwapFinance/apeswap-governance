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

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

interface IxToken {
    event Redeem(address indexed to, uint256 xGnanaAmount, uint256 gnanaAmount);
    event Deposit(address indexed from, uint256 xGnanaAmount, uint256 gnanaActualAmount);

    function exchangeRate() external returns (uint256);
    function redeem(uint256 amount) external;
    function deposit(uint256 amount) external;
}

contract xGNANA is IxToken, ERC20, ERC20Permit, ERC20Votes {
    using SafeERC20 for ERC20;

    ERC20 public immutable gnana;
    mapping(address => address) private _delegates;


    constructor(ERC20 gnana_) ERC20("X Golden Banana", "xGNANA") ERC20Permit("X Golden Banana") {
        gnana = gnana_;
    }

    function gnanaBalance() public view returns (uint256) {
        return gnana.balanceOf(address(this));
    }

    function exchangeRate() public view returns (uint256) {
        return gnanaBalance() * 1e18 / totalSupply();
    }

    function redeem(uint256 xGnanaAmount) external {
        uint256 gnanaAmount = (xGnanaAmount * exchangeRate()) / 1e18;
        _burn(msg.sender, xGnanaAmount);
        gnana.safeTransfer(msg.sender, gnanaAmount);
        emit Redeem(msg.sender, xGnanaAmount, gnanaAmount); 
    }

    function deposit(uint256 gnanaGrossAmount) external {
        uint256 currentExchangeRate = exchangeRate();
        uint256 gnanaActualAmount = _transferGnanaFrom(msg.sender, gnanaGrossAmount);
        
        uint256 xGnanaAmount = (gnanaActualAmount * 1e18) / currentExchangeRate;
        _mint(msg.sender, xGnanaAmount);
        emit Deposit(msg.sender, xGnanaAmount, gnanaActualAmount); 
    }

    function _transferGnanaFrom(address from, uint256 gnanaGrossAmount) internal returns (uint256 gnanaActualAmount) {
        uint256 previousGnanaBalance = gnanaBalance();
        gnana.safeTransferFrom(from, address(this), gnanaGrossAmount);
        gnanaActualAmount = gnanaBalance() - previousGnanaBalance;
    }

    /**
     * @dev Override _transfer and prevent transferability.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal pure override(ERC20) {
        revert("xGNANA is non-transferrable");
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}