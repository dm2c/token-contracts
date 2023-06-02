// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/finance/VestingWallet.sol";

contract RestrictedVestingWallet is VestingWallet {
    constructor(
        address beneficiaryAddress,
        uint64 startTimestamp,
        uint64 durationSeconds
    ) VestingWallet(beneficiaryAddress, startTimestamp, durationSeconds) {}

    modifier onlyBeneficiary() {
        require(
            _msgSender() == beneficiary(),
            "RestrictedVestingWallet: caller is not the beneficiary"
        );
        _;
    }
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp)
        internal
        view
        virtual
        override
        returns (uint256)
    {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp >= start() + duration()) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - start())) / duration();
        }
    }

    /**
     * @dev Release the Eth, and can only be released by a beneficiary.
     */
    function release() public override onlyBeneficiary {
        super.release();
    }

    /**
     * @dev Release the tokens, and can only be released by a beneficiary.
     */
    function release(address token) public override onlyBeneficiary {
        super.release(token);
    }
}
