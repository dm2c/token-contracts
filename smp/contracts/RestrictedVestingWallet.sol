// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/finance/VestingWallet.sol";

/**
 * @notice Vesting Wallet which release is only allowed to beneficiary
 */
contract RestrictedVestingWallet is VestingWallet {
    /**
     * @dev Set the beneficiary, start timestamp and vesting duration of the vesting wallet.
     */
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

    /**
     * @dev This returns the amount vested, as a function of time, for
     * an asset given its total historical allocation.
     */
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp)
        internal
        view
        virtual
        override
        returns (uint256)
    {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp >= start() + duration()) { // Avoid division by zero duration
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
