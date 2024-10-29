// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./L2StandardERC20.sol";

contract L2StandardUSDC is L2StandardERC20 {
    constructor(
        address _l2Bridge,
        address _l1Token,
        string memory _name,
        string memory _symbol
    ) L2StandardERC20(_l2Bridge, _l1Token, _name, _symbol) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}