// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./L1StandardERC20.sol";

contract USDCMock is L1StandardERC20 {

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE` and `PAUSER_ROLE` to the
     * account that deploys the contract.
     *
     * See {ERC20-constructor}.
     */
    constructor(
        address owner,
        string memory name,
        string memory symbol
    ) L1StandardERC20(owner, name, symbol) {
        
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}