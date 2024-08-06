// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { SeamoonProtocolAdapter } from "../SeamoonProtocolAdapter.sol";

// @dev WARNING: This is for testing purposes only
contract SeamoonProtocolAdapterMock is SeamoonProtocolAdapter {
    constructor(address _token, address _lzEndpoint, address _delegate) SeamoonProtocolAdapter(_token, _lzEndpoint, _delegate) {}
}
