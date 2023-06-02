// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "./RestrictedVestingWallet.sol";

contract Minter is Ownable {
    ERC20PresetMinterPauser public erc20;
    uint256 public capAmount;
    uint256 public mintStart;
    uint256 public mintingDuration;
    uint256 public lockingDuration;
    uint256 public vestingDuration;
    uint256 private mintedAmount;

    event Mint(address vestingWallet, uint256 amount);

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
