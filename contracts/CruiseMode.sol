// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CruiseMode (Long-Term Prediction Staking)
/// @notice Minimal MVP staking with trend-based multiplier simulation.
contract CruiseMode is Ownable {
    struct Stake {
        uint256 amountWei;
        uint64 startTs;
        uint32 lockSeconds; // 1-7 days in seconds for MVP
        bool active;
    }

    mapping(address => Stake) public stakes;
    uint256 public houseEdgeBps = 200; // 2%
    address public treasury;

    // Trend multiplier set by owner for MVP demo (e.g., 80 => 0.80x, 120 => 1.20x)
    uint256 public trendX100 = 100; // 1.00x baseline

    event Staked(address indexed user, uint256 amountWei, uint32 lockSeconds);
    event Unstaked(address indexed user, uint256 payoutWei, uint256 appliedX100);
    event TrendUpdated(uint256 newTrendX100);
    event HouseEdgeUpdated(uint256 newEdgeBps);
    event TreasuryUpdated(address newTreasury);

    constructor(address initialOwner, address treasuryAddress) Ownable(initialOwner) {
        require(treasuryAddress != address(0), "treasury=0");
        treasury = treasuryAddress;
    }

    // ---------------- Admin ----------------
    function setTrend(uint256 newTrendX100) external onlyOwner {
        require(newTrendX100 >= 50 && newTrendX100 <= 300, "trend range");
        trendX100 = newTrendX100;
        emit TrendUpdated(newTrendX100);
    }

    function setHouseEdge(uint256 newEdgeBps) external onlyOwner {
        require(newEdgeBps <= 1_000, "edge too high");
        houseEdgeBps = newEdgeBps;
        emit HouseEdgeUpdated(newEdgeBps);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "treasury=0");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function fund() external payable {}

    // ---------------- User ----------------
    function stake(uint32 lockSeconds) external payable {
        require(msg.value > 0, "no value");
        require(lockSeconds >= 1 days && lockSeconds <= 7 days, "lock 1-7d");
        Stake storage s = stakes[msg.sender];
        require(!s.active, "already staked");
        s.amountWei = msg.value;
        s.startTs = uint64(block.timestamp);
        s.lockSeconds = lockSeconds;
        s.active = true;
        emit Staked(msg.sender, msg.value, lockSeconds);
    }

    function canUnstake(address user) public view returns (bool) {
        Stake memory s = stakes[user];
        if (!s.active) return false;
        return block.timestamp >= uint256(s.startTs) + uint256(s.lockSeconds);
    }

    function previewPayout(address user) public view returns (uint256 payoutWei, uint256 appliedX100) {
        Stake memory s = stakes[user];
        if (!s.active) return (0, 0);
        appliedX100 = trendX100;
        uint256 gross = (s.amountWei * appliedX100) / 100;
        uint256 fee = (gross * houseEdgeBps) / 10_000;
        payoutWei = gross - fee;
    }

    function unstake() external {
        require(canUnstake(msg.sender), "locked");
        (uint256 payout, uint256 appliedX100) = previewPayout(msg.sender);
        Stake storage s = stakes[msg.sender];
        require(s.active && s.amountWei > 0, "no stake");
        s.active = false;
        s.amountWei = 0;
        s.startTs = 0;
        s.lockSeconds = 0;

        // Send fee to treasury separately (house edge already deducted in payout).
        // For MVP simplicity we keep funds in contract; production would separate.
        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "payout fail");
        emit Unstaked(msg.sender, payout, appliedX100);
    }
}


