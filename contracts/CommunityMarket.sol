// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title CommunityMarket - MVP pooled YES/NO prediction markets
/// @notice Centralized resolution for hackathon MVP. Replace with oracle for production.
contract CommunityMarket is Ownable, ReentrancyGuard {
    struct Market {
        address creator;
        string title;
        string description;
        string category;
        string privateGroupId; // empty means public
        uint64 endsAt;
        uint32 yesOddsX100; // 200 = 2.00x
        uint32 noOddsX100;  // 200 = 2.00x
        uint256 totalYesWei;
        uint256 totalNoWei;
        bool resolved;
        bool outcomeYes; // true => YES wins
    }

    uint256 public marketCount;
    mapping(uint256 => Market) public markets; // id => market
    mapping(uint256 => mapping(address => uint256)) public userYesWei; // id => user => amount
    mapping<uint256 => mapping(address => uint256)) public userNoWei;  // id => user => amount

    uint256 public houseEdgeBps = 200; // 2%
    address public treasury;

    event MarketCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string category,
        string privateGroupId,
        uint64 endsAt,
        uint32 yesOddsX100,
        uint32 noOddsX100
    );
    event BetPlaced(uint256 indexed id, address indexed user, bool yes, uint256 amountWei);
    event Resolved(uint256 indexed id, bool outcomeYes);
    event Claimed(uint256 indexed id, address indexed user, uint256 payoutWei, uint256 feeWei);
    event HouseEdgeUpdated(uint256 newHouseEdgeBps);
    event TreasuryUpdated(address newTreasury);

    constructor(address initialOwner, address treasuryAddress) Ownable(initialOwner) {
        require(treasuryAddress != address(0), "treasury=0");
        treasury = treasuryAddress;
    }

    // ---------------- Admin ----------------
    function setHouseEdge(uint256 newHouseEdgeBps) external onlyOwner {
        require(newHouseEdgeBps <= 1_000, "edge too high");
        houseEdgeBps = newHouseEdgeBps;
        emit HouseEdgeUpdated(newHouseEdgeBps);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "treasury=0");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    // ---------------- Core ----------------
    function createMarket(
        string calldata title,
        string calldata description,
        string calldata category,
        string calldata privateGroupId,
        uint64 endsAt,
        uint32 yesOddsX100,
        uint32 noOddsX100
    ) external returns (uint256 id) {
        require(bytes(title).length > 0 && bytes(description).length > 0, "empty");
        require(endsAt > block.timestamp, "endsAt past");
        require(yesOddsX100 >= 101 && noOddsX100 >= 101, "odds>=1.01x");

        id = ++marketCount;
        Market storage m = markets[id];
        m.creator = msg.sender;
        m.title = title;
        m.description = description;
        m.category = category;
        m.privateGroupId = privateGroupId;
        m.endsAt = endsAt;
        m.yesOddsX100 = yesOddsX100;
        m.noOddsX100 = noOddsX100;

        emit MarketCreated(id, msg.sender, title, category, privateGroupId, endsAt, yesOddsX100, noOddsX100);
    }

    function bet(uint256 id, bool yes) external payable nonReentrant {
        Market storage m = markets[id];
        require(m.creator != address(0), "no market");
        require(block.timestamp < m.endsAt, "ended");
        require(msg.value > 0, "no value");
        if (yes) {
            userYesWei[id][msg.sender] += msg.value;
            m.totalYesWei += msg.value;
        } else {
            userNoWei[id][msg.sender] += msg.value;
            m.totalNoWei += msg.value;
        }
        emit BetPlaced(id, msg.sender, yes, msg.value);
    }

    /// @notice MVP centralized resolution. Production should be oracle/governance driven.
    function resolve(uint256 id, bool outcomeYes) external onlyOwner {
        Market storage m = markets[id];
        require(m.creator != address(0), "no market");
        require(!m.resolved, "resolved");
        require(block.timestamp >= m.endsAt, "not ended");
        m.resolved = true;
        m.outcomeYes = outcomeYes;
        emit Resolved(id, outcomeYes);
    }

    function previewClaim(uint256 id, address user) public view returns (uint256 payoutWei, uint256 feeWei) {
        Market storage m = markets[id];
        if (!m.resolved) return (0, 0);
        uint256 amt = m.outcomeYes ? userYesWei[id][user] : userNoWei[id][user];
        if (amt == 0) return (0, 0);
        uint256 oddsX100 = m.outcomeYes ? uint256(m.yesOddsX100) : uint256(m.noOddsX100);
        uint256 gross = (amt * oddsX100) / 100;
        feeWei = (gross * houseEdgeBps) / 10_000;
        payoutWei = gross - feeWei;
    }

    function claim(uint256 id) external nonReentrant {
        Market storage m = markets[id];
        require(m.resolved, "not resolved");
        uint256 amt = m.outcomeYes ? userYesWei[id][msg.sender] : userNoWei[id][msg.sender];
        require(amt > 0, "nothing");

        // Zero-out stake before transfer to prevent reentrancy
        if (m.outcomeYes) {
            userYesWei[id][msg.sender] = 0;
        } else {
            userNoWei[id][msg.sender] = 0;
        }

        (uint256 payout, uint256 fee) = previewClaim(id, msg.sender);

        if (fee > 0) {
            (bool tf, ) = treasury.call{value: fee}("");
            require(tf, "fee fail");
        }
        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "payout fail");
        emit Claimed(id, msg.sender, payout, fee);
    }
}


