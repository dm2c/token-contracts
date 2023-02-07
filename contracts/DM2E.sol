// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * DM2E is an utility token that is not capped.
 * The total supply of the token will be maintained
 * by the MINER_ROLE and BURNER_ROLE accounts.
 * The MINER_ROLE account will mint new tokens
 * according to the economic demands such as
 * wallet count, transaction count, etc.
 * The BURNER_ROLE account will burn tokens when
 * the token is used to pay for the service,
 * the token price is too low, etc.
 */
contract DM2E is AccessControlEnumerable, ERC20Pausable, ERC20Burnable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() ERC20("DM2E", "DM2E") {
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
            "AccessControl: each role must have at least 1 member"
        );
        super._revokeRole(role, account);
    }
}
