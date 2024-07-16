// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

/**
 * DM2P is a governance token that is capped.
 * The CAP_AMOUNT is 1e10 * 1e18 (10 Billion).
 * The MINTER_ROLE account can mint new tokens up to
 * the CAP_AMOUNT.
 * Under normal circumstances, all tokens will be
 * minted when the token contract is deployed,
 * and no further operations will be performed to
 * change the total suppy.
 */
contract DM2P is
    AccessControlEnumerable,
    ERC20Pausable,
    ERC20Burnable,
    ERC20Capped
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public constant CAP_AMOUNT = 1e10 * 1e18;

    constructor() ERC20("DM2P", "DM2P") ERC20Capped(CAP_AMOUNT) {
        // All roles are granted to the deployer.
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    // Only the MINTER_ROLE account can mint new tokens up to the CAP_AMOUNT.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function _mint(
        address account,
        uint256 amount
    ) internal override(ERC20, ERC20Capped) {
        super._mint(account, amount);
    }

    // Only the PAUSER_ROLE account can pause and unpause the token.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Only the BURNER_ROLE account can burn tokens.
    function burn(uint256 amount) public override onlyRole(BURNER_ROLE) {
        super.burn(amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public override onlyRole(BURNER_ROLE) {
        super.burnFrom(account, amount);
    }

    // When the token is paused, no transfer is allowed.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    // The last member of a role cannot be revoked.
    function _revokeRole(
        bytes32 role,
        address account
    ) internal virtual override {
        require(
            getRoleMemberCount(role) > 1,
            "DM2P: each role must have at least 1 member"
        );
        super._revokeRole(role, account);
    }
}
