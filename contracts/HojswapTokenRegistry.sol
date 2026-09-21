// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @notice Owner-managed allowlist of ERC-20s that HOJ Swap may display for one chain.
/// @dev Deploy one instance on each supported chain. Native gas assets are not stored here;
///      the application derives those from its chain configuration.
contract HojswapTokenRegistry {
    struct VerifiedToken {
        address token;
        string symbol;
        string name;
        uint8 decimals;
        bool active;
    }

    address public owner;
    address public pendingOwner;

    // Position + 1 permits a zero value to mean "not registered".
    mapping(address => uint256) private tokenIndexPlusOne;
    VerifiedToken[] private tokens;

    event OwnershipTransferStarted(address indexed currentOwner, address indexed pendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed nextOwner);
    event VerifiedTokenAdded(
        address indexed token,
        string symbol,
        string name,
        uint8 decimals
    );
    event VerifiedTokenUpdated(
        address indexed token,
        string symbol,
        string name,
        uint8 decimals
    );
    event VerifiedTokenRemoved(address indexed token);

    error NotOwner();
    error NotPendingOwner();
    error ZeroAddress();
    error EmptyMetadata();
    error TokenNotRegistered();
    error TokenAlreadyInactive();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        if (nextOwner == address(0)) revert ZeroAddress();
        pendingOwner = nextOwner;
        emit OwnershipTransferStarted(owner, nextOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        address previousOwner = owner;
        owner = msg.sender;
        pendingOwner = address(0);
        emit OwnershipTransferred(previousOwner, owner);
    }

    /// @notice Adds a new token, or reactivates and updates a previously removed token.
    function addVerifiedToken(
        address token,
        string calldata symbol,
        string calldata name,
        uint8 decimals
    ) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        if (bytes(symbol).length == 0 || bytes(name).length == 0) revert EmptyMetadata();

        uint256 indexPlusOne = tokenIndexPlusOne[token];
        if (indexPlusOne == 0) {
            tokens.push(VerifiedToken({ token: token, symbol: symbol, name: name, decimals: decimals, active: true }));
            tokenIndexPlusOne[token] = tokens.length;
            emit VerifiedTokenAdded(token, symbol, name, decimals);
            return;
        }

        VerifiedToken storage existing = tokens[indexPlusOne - 1];
        existing.symbol = symbol;
        existing.name = name;
        existing.decimals = decimals;
        existing.active = true;
        emit VerifiedTokenUpdated(token, symbol, name, decimals);
    }

    /// @notice Updates an active token's display metadata without changing its verified status.
    function updateVerifiedToken(
        address token,
        string calldata symbol,
        string calldata name,
        uint8 decimals
    ) external onlyOwner {
        if (bytes(symbol).length == 0 || bytes(name).length == 0) revert EmptyMetadata();
        uint256 indexPlusOne = tokenIndexPlusOne[token];
        if (indexPlusOne == 0 || !tokens[indexPlusOne - 1].active) revert TokenNotRegistered();

        VerifiedToken storage existing = tokens[indexPlusOne - 1];
        existing.symbol = symbol;
        existing.name = name;
        existing.decimals = decimals;
        emit VerifiedTokenUpdated(token, symbol, name, decimals);
    }

    /// @notice Removes a token from the active list while preserving its audit trail.
    function removeVerifiedToken(address token) external onlyOwner {
        uint256 indexPlusOne = tokenIndexPlusOne[token];
        if (indexPlusOne == 0) revert TokenNotRegistered();

        VerifiedToken storage existing = tokens[indexPlusOne - 1];
        if (!existing.active) revert TokenAlreadyInactive();
        existing.active = false;
        emit VerifiedTokenRemoved(token);
    }

    function isVerifiedToken(address token) external view returns (bool) {
        uint256 indexPlusOne = tokenIndexPlusOne[token];
        return indexPlusOne != 0 && tokens[indexPlusOne - 1].active;
    }

    function getToken(address token) external view returns (VerifiedToken memory) {
        uint256 indexPlusOne = tokenIndexPlusOne[token];
        if (indexPlusOne == 0) revert TokenNotRegistered();
        return tokens[indexPlusOne - 1];
    }

    function getVerifiedTokens() external view returns (VerifiedToken[] memory activeTokens) {
        uint256 activeCount;
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i].active) activeCount++;
        }

        activeTokens = new VerifiedToken[](activeCount);
        uint256 activeIndex;
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i].active) activeTokens[activeIndex++] = tokens[i];
        }
    }

    function totalRegisteredTokens() external view returns (uint256) {
        return tokens.length;
    }
}
