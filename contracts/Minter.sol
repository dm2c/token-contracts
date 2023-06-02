// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "./RestrictedVestingWallet.sol";

/**
 * @notice Minter mint the necessary amount of ERC20 tokens,
 *      including DM2P and DM2E tokens in the Seamoon Protocol, at any given time.
 *      Use the Vesting contract to lock up tokens minted via the minter contract for a specific period of time.
 */
contract Minter is Ownable {
    ERC20PresetMinterPauser public erc20;
    uint256 public capAmount;
    uint256 public mintStart;
    uint256 public mintingDuration;
    uint256 public lockingDuration;
    uint256 public vestingDuration;
    uint256 private mintedAmount;

    /**
     * @dev Emitted in mint()
     *
     * @param vestingWallet an address of the Vesting contract deployed in the minting process.
     * @param amount an amount of tokens minted and locked.
     */
    event Mint(address vestingWallet, uint256 amount);

    /**
     * @dev Creates an instance of Minter
     *
     * @param _erc20 ERC20 tokens to be minted.
     * @param _capAmount The maximum amount of tokens that can be minted in this contract.
     * @param _mintStart Mintable start time.
     * @param _mintingDuration Locking period for this contract.
     *      The amount of mint available increases linearly with the minting period from the mint start date and time.
     * @param _lockingDuration Locking period for Vesting contract deployed through this contract.
     *      After the locking period from minting, tokens can be withdrawn from the Vesting contract
     *      in the amount corresponding to the vesting period.
     * @param _vestingDuration Vesting period for Vesting contract.
     */
    constructor(
        address _erc20,
        uint256 _capAmount,
        uint256 _mintStart,
        uint256 _mintingDuration,
        uint256 _lockingDuration,
        uint256 _vestingDuration
    ) {
        require(_erc20 != address(0), "Minter: zero address");
        require(_capAmount > 0, "Minter: cap amount is zero");
        require(_mintStart >= block.timestamp, "Minter: mint start is zero");

        erc20 = ERC20PresetMinterPauser(_erc20);
        capAmount = _capAmount;
        mintStart = _mintStart;
        mintingDuration = _mintingDuration;
        lockingDuration = _lockingDuration;
        vestingDuration = _vestingDuration;
    }

    /**
     * @dev Get current mintable amount.
     */
    function mintableAmount() public view returns (uint256) {
        return _mintingSchedule(uint64(block.timestamp)) - mintedAmount;
    }

    function _mintingSchedule(uint64 timestamp)
        internal
        view
        returns (uint256)
    {
        if (timestamp < mintStart) {
            return 0;
        } else if (timestamp >= mintStart + mintingDuration) {
            return capAmount;
        } else {
            return (capAmount * (timestamp - mintStart)) / mintingDuration;
        }
    }

    /**
     * @dev Mint the specified amount of tokens and locked into the Vesting contract,
     *      which is created anew each time.
     *
     * @param beneficiary an address who is able to withdraw tokens from Vesting contract.
     * @param amount an amount to mint.
     */
    function mint(address beneficiary, uint256 amount) external onlyOwner {
        require(beneficiary != address(0), "Minter: zero address");
        require(amount > 0, "Minter: amount is zero");
        require(block.timestamp >= mintStart, "Minter: mint is not started");
        uint256 mintable = mintableAmount();
        require(
            amount <= mintable,
            "Minter: minting amount is greater than mintable"
        );

        mintedAmount += amount;
        RestrictedVestingWallet vesting = new RestrictedVestingWallet(
            beneficiary,
            uint64(block.timestamp + lockingDuration),
            uint64(vestingDuration)
        );
        erc20.mint(address(vesting), amount);
        emit Mint(address(vesting), amount);
    }
}
