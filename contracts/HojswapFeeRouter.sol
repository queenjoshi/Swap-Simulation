// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract HojswapFeeRouter {
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant HOUSE_FEE_BPS = 100;

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

    address public owner;
    address public houseWallet;
    bool private locked;

    mapping(address => bool) public approvedSwapTargets;
    mapping(address => bool) public approvedSpenders;
    mapping(address => mapping(address => bool)) public approvedRouterSpenders;

    event OwnershipTransferred(address indexed previousOwner, address indexed nextOwner);
    event HouseWalletUpdated(address indexed previousWallet, address indexed nextWallet);
    event SwapTargetApprovalUpdated(address indexed target, bool approved);
    event SpenderApprovalUpdated(address indexed spender, bool approved);
    event RouterSpenderApprovalUpdated(address indexed router, address indexed spender, bool approved);
    event HouseFeeCollected(address indexed token, address indexed payer, uint256 amount);
    event SwapExecuted(
        address indexed sender,
        address indexed recipient,
        address indexed sellToken,
        address buyToken,
        uint256 sellAmount,
        uint256 feeAmount,
        uint256 buyAmount
    );

    error NotOwner();
    error ReentrantCall();
    error ZeroAddress();
    error ZeroAmount();
    error ArrayLengthMismatch();
    error TargetNotApproved();
    error SpenderNotApproved();
    error SameTokenUnsupported();
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

    constructor(address initialHouseWallet, address[] memory initialSwapTargets, address[] memory initialSpenders) {
        if (initialHouseWallet == address(0)) revert ZeroAddress();
        if (initialSwapTargets.length != initialSpenders.length) revert ArrayLengthMismatch();
        owner = msg.sender;
        houseWallet = initialHouseWallet;
        emit OwnershipTransferred(address(0), msg.sender);
        emit HouseWalletUpdated(address(0), initialHouseWallet);

        for (uint256 i = 0; i < initialSwapTargets.length; i++) {
            approvedSwapTargets[initialSwapTargets[i]] = true;
            approvedSpenders[initialSpenders[i]] = true;
            approvedRouterSpenders[initialSwapTargets[i]][initialSpenders[i]] = true;
            emit SwapTargetApprovalUpdated(initialSwapTargets[i], true);
            emit SpenderApprovalUpdated(initialSpenders[i], true);
            emit RouterSpenderApprovalUpdated(initialSwapTargets[i], initialSpenders[i], true);
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

    function setSwapTargetApproval(address target, bool approved) external onlyOwner {
        if (target == address(0)) revert ZeroAddress();
        approvedSwapTargets[target] = approved;
        emit SwapTargetApprovalUpdated(target, approved);
    }

    function setSpenderApproval(address spender, bool approved) external onlyOwner {
        if (spender == address(0)) revert ZeroAddress();
        approvedSpenders[spender] = approved;
        emit SpenderApprovalUpdated(spender, approved);
    }

    function setRouterSpenderApproval(address router, address spender, bool approved) external onlyOwner {
        if (router == address(0)) revert ZeroAddress();
        approvedRouterSpenders[router][spender] = approved;
        emit RouterSpenderApprovalUpdated(router, spender, approved);
    }

    function swapExactNative(
        address swapTarget,
        bytes calldata swapCallData,
        address buyToken,
        uint256 minBuyAmount,
        address recipient
    ) external payable nonReentrant returns (uint256 buyAmount) {
        if (recipient == address(0) || buyToken == address(0)) revert ZeroAddress();
        if (msg.value == 0) revert ZeroAmount();
        _requireApprovedPair(swapTarget, address(0));

        uint256 nativeBalanceBefore = address(this).balance - msg.value;

        uint256 feeAmount = _feeAmount(msg.value);
        uint256 swapAmount = msg.value - feeAmount;
        if (swapAmount == 0) revert ZeroAmount();

        _sendNative(houseWallet, feeAmount);
        emit HouseFeeCollected(address(0), msg.sender, feeAmount);

        uint256 buyBalanceBefore = _tokenBalance(buyToken);
        _callSwapTarget(swapTarget, swapAmount, swapCallData);
        buyAmount = _tokenBalance(buyToken) - buyBalanceBefore;

        if (buyAmount < minBuyAmount) revert InsufficientBuyAmount(buyAmount, minBuyAmount);
        _safeTransfer(buyToken, recipient, buyAmount);

        _refundNativeDelta(recipient, nativeBalanceBefore);
        emit SwapExecuted(msg.sender, recipient, address(0), buyToken, msg.value, feeAmount, buyAmount);
    }

    function swapExactToken(TokenSwapParams calldata params) external nonReentrant returns (uint256 buyAmount) {
        if (params.sellToken == address(0) || params.spender == address(0) || params.recipient == address(0)) {
            revert ZeroAddress();
        }
        if (params.sellAmount == 0) revert ZeroAmount();
        if (params.sellToken == params.buyToken) revert SameTokenUnsupported();
        _requireApprovedPair(params.swapTarget, params.spender);

        uint256 sellBalanceBefore = _tokenBalance(params.sellToken);
        uint256 buyBalanceBefore = params.buyToken == address(0)
            ? address(this).balance
            : _tokenBalance(params.buyToken);

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

        uint256 buyBalanceAfter = params.buyToken == address(0)
            ? address(this).balance
            : _tokenBalance(params.buyToken);
        buyAmount = buyBalanceAfter - buyBalanceBefore;
        if (buyAmount < params.minBuyAmount) revert InsufficientBuyAmount(buyAmount, params.minBuyAmount);

        if (params.buyToken == address(0)) {
            _sendNative(params.recipient, buyAmount);
        } else {
            _safeTransfer(params.buyToken, params.recipient, buyAmount);
        }

        _refundSellTokenDelta(params.sellToken, params.recipient, sellBalanceBefore);

        emit SwapExecuted(
            msg.sender,
            params.recipient,
            params.sellToken,
            params.buyToken,
            actualSellAmount,
            feeAmount,
            buyAmount
        );
    }

    function rescueToken(address token, address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (token == address(0)) _sendNative(to, amount);
        else _safeTransfer(token, to, amount);
    }

    function _feeAmount(uint256 amount) private pure returns (uint256) {
        return (amount * HOUSE_FEE_BPS + BPS_DENOMINATOR - 1) / BPS_DENOMINATOR;
    }

    function _requireApprovedTarget(address target) private view {
        if (target == address(0)) revert ZeroAddress();
        if (!approvedSwapTargets[target]) revert TargetNotApproved();
    }

    function _requireApprovedPair(address target, address spender) private view {
        _requireApprovedTarget(target);
        if (!approvedRouterSpenders[target][spender]) revert SpenderNotApproved();
    }

    function _callSwapTarget(address target, uint256 value, bytes calldata data) private {
        (bool success, bytes memory result) = target.call{ value: value }(data);
        if (!success) revert SwapCallFailed(result);
    }

    function _tokenBalance(address token) private view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function _sendNative(address to, uint256 amount) private {
        (bool success, ) = to.call{ value: amount }("");
        if (!success) revert NativeTransferFailed();
    }

    function _refundNativeDelta(address recipient, uint256 nativeBalanceBefore) private {
        uint256 balance = address(this).balance;
        if (balance > nativeBalanceBefore) _sendNative(recipient, balance - nativeBalanceBefore);
    }

    function _refundSellTokenDelta(address sellToken, address recipient, uint256 sellBalanceBefore) private {
        uint256 sellBalanceAfter = _tokenBalance(sellToken);
        if (sellBalanceAfter > sellBalanceBefore) {
            _safeTransfer(sellToken, recipient, sellBalanceAfter - sellBalanceBefore);
        }
    }

    function _safeTransfer(address token, address to, uint256 amount) private {
        (bool success, bytes memory data) = token.call(abi.encodeCall(IERC20.transfer, (to, amount)));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert TokenCallFailed();
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) private {
        (bool success, bytes memory data) = token.call(abi.encodeCall(IERC20.transferFrom, (from, to, amount)));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert TokenCallFailed();
    }

    function _forceApprove(address token, address spender, uint256 amount) private {
        (bool resetSuccess, bytes memory resetData) = token.call(abi.encodeCall(IERC20.approve, (spender, 0)));
        if (!resetSuccess || (resetData.length != 0 && !abi.decode(resetData, (bool)))) revert TokenCallFailed();

        if (amount == 0) return;

        (bool success, bytes memory data) = token.call(abi.encodeCall(IERC20.approve, (spender, amount)));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert TokenCallFailed();
    }
}
