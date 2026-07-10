// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IHojswapERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract HojswapRouterV2 {
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant HOUSE_FEE_BPS = 100;
    uint256 public constant MAX_DESTINATION_ADDRESS_BYTES = 160;

    struct SwapParams {
        address swapTarget;
        bytes swapCallData;
        address buyToken;
        uint256 minBuyAmount;
        address recipient;
    }

    struct TokenSwapParams {
        address sellToken;
        uint256 sellAmount;
        address spender;
        address swapTarget;
        bytes swapCallData;
        address buyToken;
        uint256 minBuyAmount;
        address recipient;
    }

    struct BridgeMetadata {
        uint256 destinationChainId;
        string destinationAddress;
    }

    address public owner;
    address public houseWallet;
    bool public paused;
    bool private locked;

    mapping(address => mapping(address => bool)) public approvedRouterSpenders;
    mapping(uint256 => bool) public supportedDestinationChains;

    event OwnershipTransferred(address indexed previousOwner, address indexed nextOwner);
    event HouseWalletUpdated(address indexed previousWallet, address indexed nextWallet);
    event PauseStatusUpdated(bool paused);
    event RouterSpenderApprovalUpdated(address indexed router, address indexed spender, bool approved);
    event DestinationChainSupportUpdated(uint256 indexed destinationChainId, bool supported);
    event HouseFeeCollected(address indexed token, address indexed payer, uint256 amount);
    event SwapExecuted(
        address indexed sender,
        address indexed recipient,
        address indexed sellToken,
        address buyToken,
        uint256 sellAmount,
        uint256 feeAmount,
        uint256 buyAmount,
        address swapTarget
    );
    event BridgeRouteRecorded(
        address indexed sender,
        address indexed sellToken,
        address indexed buyToken,
        uint256 destinationChainId,
        string destinationAddress
    );
    event AssetsRescued(address indexed token, address indexed to, uint256 amount);

    error NotOwner();
    error ReentrantCall();
    error ContractPaused();
    error ZeroAddress();
    error ZeroAmount();
    error ArrayLengthMismatch();
    error RouterSpenderPairNotApproved();
    error SameTokenUnsupported();
    error DestinationChainNotSupported();
    error InvalidDestinationAddress();
    error InsufficientBuyAmount(uint256 actual, uint256 minimum);
    error NativeTransferFailed();
    error SwapCallFailed(bytes reason);
    error TokenCallFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier nonReentrant() {
        if (locked) revert ReentrantCall();
        locked = true;
        _;
        locked = false;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    constructor(address initialHouseWallet, address[] memory initialRouters, address[] memory initialSpenders) {
        if (initialHouseWallet == address(0)) revert ZeroAddress();
        if (initialRouters.length != initialSpenders.length) revert ArrayLengthMismatch();

        owner = msg.sender;
        houseWallet = initialHouseWallet;

        emit OwnershipTransferred(address(0), msg.sender);
        emit HouseWalletUpdated(address(0), initialHouseWallet);

        for (uint256 i = 0; i < initialRouters.length; i++) {
            _setRouterSpenderApproval(initialRouters[i], initialSpenders[i], true);
        }
    }

    receive() external payable {}

    function transferOwnership(address nextOwner) external onlyOwner {
        if (nextOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, nextOwner);
        owner = nextOwner;
    }

    function setHouseWallet(address nextHouseWallet) external onlyOwner {
        if (nextHouseWallet == address(0)) revert ZeroAddress();
        emit HouseWalletUpdated(houseWallet, nextHouseWallet);
        houseWallet = nextHouseWallet;
    }

    function setPaused(bool nextPaused) external onlyOwner {
        paused = nextPaused;
        emit PauseStatusUpdated(nextPaused);
    }

    function setRouterSpenderApproval(address router, address spender, bool approved) external onlyOwner {
        _setRouterSpenderApproval(router, spender, approved);
    }

    function setDestinationChainSupport(uint256 destinationChainId, bool supported) external onlyOwner {
        if (destinationChainId == 0) revert DestinationChainNotSupported();
        supportedDestinationChains[destinationChainId] = supported;
        emit DestinationChainSupportUpdated(destinationChainId, supported);
    }

    function swapExactNative(SwapParams calldata params)
        external
        payable
        nonReentrant
        whenNotPaused
        returns (uint256 buyAmount)
    {
        return _swapExactNative(params);
    }

    function swapExactToken(TokenSwapParams calldata params)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 buyAmount)
    {
        return _swapExactToken(params);
    }

    function swapExactNativeWithBridgeMetadata(SwapParams calldata params, BridgeMetadata calldata metadata)
        external
        payable
        nonReentrant
        whenNotPaused
        returns (uint256 buyAmount)
    {
        _validateBridgeMetadata(metadata);
        buyAmount = _swapExactNative(params);
        emit BridgeRouteRecorded(
            msg.sender,
            address(0),
            params.buyToken,
            metadata.destinationChainId,
            metadata.destinationAddress
        );
    }

    function swapExactTokenWithBridgeMetadata(TokenSwapParams calldata params, BridgeMetadata calldata metadata)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 buyAmount)
    {
        _validateBridgeMetadata(metadata);
        buyAmount = _swapExactToken(params);
        emit BridgeRouteRecorded(
            msg.sender,
            params.sellToken,
            params.buyToken,
            metadata.destinationChainId,
            metadata.destinationAddress
        );
    }

    function rescueAssets(address token, address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        if (token == address(0)) {
            _sendNative(to, amount);
        } else {
            _safeTransfer(token, to, amount);
        }

        emit AssetsRescued(token, to, amount);
    }

    function _swapExactNative(SwapParams calldata params) private returns (uint256 buyAmount) {
        if (params.recipient == address(0) || params.buyToken == address(0)) revert ZeroAddress();
        if (msg.value == 0) revert ZeroAmount();
        _requireApprovedPair(params.swapTarget, address(0));

        uint256 nativeBalanceBefore = address(this).balance - msg.value;
        uint256 feeAmount = _feeAmount(msg.value);
        uint256 swapAmount = msg.value - feeAmount;
        if (swapAmount == 0) revert ZeroAmount();

        _sendNative(houseWallet, feeAmount);
        emit HouseFeeCollected(address(0), msg.sender, feeAmount);

        uint256 buyBalanceBefore = _tokenBalance(params.buyToken);
        _callSwapTarget(params.swapTarget, swapAmount, params.swapCallData);
        buyAmount = _tokenBalance(params.buyToken) - buyBalanceBefore;

        if (buyAmount < params.minBuyAmount) {
            revert InsufficientBuyAmount(buyAmount, params.minBuyAmount);
        }

        _safeTransfer(params.buyToken, params.recipient, buyAmount);
        _refundNativeDelta(params.recipient, nativeBalanceBefore);

        emit SwapExecuted(
            msg.sender,
            params.recipient,
            address(0),
            params.buyToken,
            msg.value,
            feeAmount,
            buyAmount,
            params.swapTarget
        );
    }

    function _swapExactToken(TokenSwapParams calldata params) private returns (uint256 buyAmount) {
        if (
            params.sellToken == address(0) ||
            params.spender == address(0) ||
            params.recipient == address(0)
        ) revert ZeroAddress();
        if (params.sellAmount == 0) revert ZeroAmount();
        if (params.sellToken == params.buyToken) revert SameTokenUnsupported();
        _requireApprovedPair(params.swapTarget, params.spender);

        uint256 sellBalanceBefore = _tokenBalance(params.sellToken);
        uint256 nativeBalanceBefore = address(this).balance;
        uint256 buyBalanceBefore = _assetBalance(params.buyToken);

        _safeTransferFrom(params.sellToken, msg.sender, address(this), params.sellAmount);
        uint256 actualSellAmount = _tokenBalance(params.sellToken) - sellBalanceBefore;
        if (actualSellAmount == 0) revert ZeroAmount();

        uint256 feeAmount = _feeAmount(actualSellAmount);
        uint256 swapAmount = actualSellAmount - feeAmount;
        if (swapAmount == 0) revert ZeroAmount();

        _safeTransfer(params.sellToken, houseWallet, feeAmount);
        emit HouseFeeCollected(params.sellToken, msg.sender, feeAmount);

        _forceApprove(params.sellToken, params.spender, swapAmount);
        _callSwapTarget(params.swapTarget, 0, params.swapCallData);
        _forceApprove(params.sellToken, params.spender, 0);

        buyAmount = _assetBalance(params.buyToken) - buyBalanceBefore;
        if (buyAmount < params.minBuyAmount) {
            revert InsufficientBuyAmount(buyAmount, params.minBuyAmount);
        }

        _settleBoughtAsset(params.buyToken, params.recipient, buyAmount, nativeBalanceBefore);
        _refundSellTokenDelta(params.sellToken, params.recipient, sellBalanceBefore);
        _emitTokenSwapExecuted(params, actualSellAmount, feeAmount, buyAmount);
    }

    function _setRouterSpenderApproval(address router, address spender, bool approved) private {
        if (router == address(0)) revert ZeroAddress();
        approvedRouterSpenders[router][spender] = approved;
        emit RouterSpenderApprovalUpdated(router, spender, approved);
    }

    function _settleBoughtAsset(address buyToken, address recipient, uint256 buyAmount, uint256 nativeBalanceBefore)
        private
    {
        _sendAsset(buyToken, recipient, buyAmount);
        _refundNativeDelta(recipient, nativeBalanceBefore);
    }

    function _refundSellTokenDelta(address sellToken, address recipient, uint256 sellBalanceBefore) private {
        uint256 sellBalanceAfter = _tokenBalance(sellToken);
        if (sellBalanceAfter > sellBalanceBefore) {
            _safeTransfer(sellToken, recipient, sellBalanceAfter - sellBalanceBefore);
        }
    }

    function _emitTokenSwapExecuted(
        TokenSwapParams calldata params,
        uint256 actualSellAmount,
        uint256 feeAmount,
        uint256 buyAmount
    ) private {
        emit SwapExecuted(
            msg.sender,
            params.recipient,
            params.sellToken,
            params.buyToken,
            actualSellAmount,
            feeAmount,
            buyAmount,
            params.swapTarget
        );
    }

    function _validateBridgeMetadata(BridgeMetadata calldata metadata) private view {
        uint256 destinationAddressLength = bytes(metadata.destinationAddress).length;
        if (!supportedDestinationChains[metadata.destinationChainId]) revert DestinationChainNotSupported();
        if (destinationAddressLength == 0 || destinationAddressLength > MAX_DESTINATION_ADDRESS_BYTES) {
            revert InvalidDestinationAddress();
        }
    }

    function _feeAmount(uint256 amount) private pure returns (uint256) {
        return (amount * HOUSE_FEE_BPS + BPS_DENOMINATOR - 1) / BPS_DENOMINATOR;
    }

    function _requireApprovedPair(address router, address spender) private view {
        if (router == address(0)) revert ZeroAddress();
        if (!approvedRouterSpenders[router][spender]) revert RouterSpenderPairNotApproved();
    }

    function _callSwapTarget(address target, uint256 value, bytes calldata data) private {
        (bool success, bytes memory result) = target.call{ value: value }(data);
        if (!success) revert SwapCallFailed(result);
    }

    function _assetBalance(address token) private view returns (uint256) {
        return token == address(0) ? address(this).balance : _tokenBalance(token);
    }

    function _tokenBalance(address token) private view returns (uint256) {
        return IHojswapERC20(token).balanceOf(address(this));
    }

    function _sendAsset(address token, address to, uint256 amount) private {
        if (token == address(0)) {
            _sendNative(to, amount);
        } else {
            _safeTransfer(token, to, amount);
        }
    }

    function _sendNative(address to, uint256 amount) private {
        (bool success, ) = to.call{ value: amount }("");
        if (!success) revert NativeTransferFailed();
    }

    function _refundNativeDelta(address recipient, uint256 nativeBalanceBefore) private {
        uint256 balance = address(this).balance;
        if (balance > nativeBalanceBefore) {
            _sendNative(recipient, balance - nativeBalanceBefore);
        }
    }

    function _safeTransfer(address token, address to, uint256 amount) private {
        (bool success, bytes memory data) = token.call(abi.encodeCall(IHojswapERC20.transfer, (to, amount)));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert TokenCallFailed();
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeCall(IHojswapERC20.transferFrom, (from, to, amount))
        );
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert TokenCallFailed();
    }

    function _forceApprove(address token, address spender, uint256 amount) private {
        (bool resetSuccess, bytes memory resetData) = token.call(abi.encodeCall(IHojswapERC20.approve, (spender, 0)));
        if (!resetSuccess || (resetData.length != 0 && !abi.decode(resetData, (bool)))) revert TokenCallFailed();

        if (amount == 0) return;

        (bool success, bytes memory data) = token.call(abi.encodeCall(IHojswapERC20.approve, (spender, amount)));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert TokenCallFailed();
    }
}
