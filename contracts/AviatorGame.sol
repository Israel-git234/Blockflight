// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// Minimal Chainlink Aggregator interface to avoid external deps in MVP
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/// @title AviatorGame (Flight Mode)
/// @notice Minimal MVP crash game with house edge and simple crash generation.
///         This version uses pseudo-randomness for hackathon MVP; replace with
///         Chainlink VRF + price feeddriven volatility for production.
contract AviatorGame is Ownable {
    struct Bet {
        uint256 amountWei;
        bool active;
    }

    // Round state
    uint256 public currentRoundId;
    uint256 public crashMultiplierX100; // e.g., 150 => 1.50x
    bool public bettingOpen;
    uint256 public roundStartTs;
    int256 public roundStartPrice; // from price feed

    // Economics
    uint256 public houseEdgeBps = 200; // 2% in basis points
    address public treasury;

    // Market-driven parameters
    AggregatorV3Interface public priceFeed; // e.g., ETH/USD
    uint256 public baseX100 = 100; // 1.00x base
    uint256 public factorPerPct = 20; // 20x per 1% move (as example)
    uint256 public maxMultiplierX100 = 5_000; // cap 50.00x
    uint256 public minCashoutX100 = 130; // 1.30x minimum to prevent farming

    mapping(address => Bet) public bets;

    event RoundOpened(uint256 indexed roundId);
    event RoundClosed(uint256 indexed roundId, uint256 crashMultiplierX100);
    event BetPlaced(address indexed player, uint256 indexed roundId, uint256 amountWei);
    event CashOut(address indexed player, uint256 indexed roundId, uint256 targetX100, uint256 payoutWei);
    event HouseEdgeUpdated(uint256 newHouseEdgeBps);
    event TreasuryUpdated(address newTreasury);
    event PriceFeedUpdated(address feed);
    event RiskParamsUpdated(uint256 baseX100, uint256 factorPerPct, uint256 maxMultiplierX100, uint256 minCashoutX100);

    constructor(address initialOwner, address treasuryAddress) Ownable(initialOwner) {
        require(treasuryAddress != address(0), "treasury=0");
        treasury = treasuryAddress;
        _openNewRound();
    }

    // ------------------------- Admin -------------------------

    function setHouseEdge(uint256 newHouseEdgeBps) external onlyOwner {
        require(newHouseEdgeBps <= 1_000, "edge too high"); // <=10%
        houseEdgeBps = newHouseEdgeBps;
        emit HouseEdgeUpdated(newHouseEdgeBps);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "treasury=0");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function setPriceFeed(address aggregator) external onlyOwner {
        priceFeed = AggregatorV3Interface(aggregator);
        emit PriceFeedUpdated(aggregator);
    }

    function setRiskParams(
        uint256 newBaseX100,
        uint256 newFactorPerPct,
        uint256 newMaxMultiplierX100,
        uint256 newMinCashoutX100
    ) external onlyOwner {
        require(newBaseX100 >= 100, "base>=1.00x");
        require(newMaxMultiplierX100 >= newBaseX100, "max>=base");
        require(newMinCashoutX100 >= 101, "min>=1.01x");
        baseX100 = newBaseX100;
        factorPerPct = newFactorPerPct;
        maxMultiplierX100 = newMaxMultiplierX100;
        minCashoutX100 = newMinCashoutX100;
        emit RiskParamsUpdated(baseX100, factorPerPct, maxMultiplierX100, minCashoutX100);
    }

    /// @notice Funds contract liquidity to pay out winners.
    function fund() external payable {}

    // ------------------------- Game Flow -------------------------

    /// @notice Open betting for a new round.
    function _openNewRound() internal {
        currentRoundId += 1;
        crashMultiplierX100 = 0;
        bettingOpen = true;
        roundStartTs = block.timestamp;

        // snapshot starting price if feed set
        if (address(priceFeed) != address(0)) {
            (, int256 answer,,,) = priceFeed.latestRoundData();
            roundStartPrice = answer;
        } else {
            roundStartPrice = 0; // indicates feed not used
        }
        emit RoundOpened(currentRoundId);
    }

    /// @notice Close betting and compute crash multiplier using simple formula.
    /// @param volatilityBps Market volatility proxy in basis points (e.g., 0-1000).
    /// @dev For MVP uses block.prevrandao; replace with VRF + price feeds.
    function closeAndSetCrash(uint256 volatilityBps) external onlyOwner {
        require(bettingOpen, "already closed");
        bettingOpen = false;

        // If price feed available, compute price change since round start
        uint256 computedX100 = baseX100;
        if (address(priceFeed) != address(0) && roundStartPrice != 0) {
            (, int256 latest,,,) = priceFeed.latestRoundData();
            int256 start = roundStartPrice;
            int256 diff = latest - start;
            if (diff < 0) diff = -diff;
            // priceChangeBps = |new-start| * 10000 / start
            uint256 priceChangeBps = uint256(diff) * 10_000 / uint256(start > 0 ? start : int256(1));
            // crashX100 = baseX100 + priceChangeBps * factorPerPct
            computedX100 = baseX100 + (priceChangeBps * factorPerPct);
        } else {
            // fallback to provided volatility
            computedX100 = baseX100 + (volatilityBps * factorPerPct) / 100; // volatilityBps ~ 1% = 100
        }

        // Add small jitter (+/- 5%) to avoid deterministic farming
        uint256 rnd = uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, currentRoundId))) % 11_000; // 0..10999
        int256 jitterBps = int256(rnd) - 5_000; // ~ -5% .. +5%
        int256 adjusted = int256(computedX100) + (int256(computedX100) * jitterBps) / 100_000;
        if (adjusted < int256(minCashoutX100)) adjusted = int256(minCashoutX100);
        if (adjusted > int256(maxMultiplierX100)) adjusted = int256(maxMultiplierX100);
        crashMultiplierX100 = uint256(adjusted);

        emit RoundClosed(currentRoundId, crashMultiplierX100);
    }

    /// @notice Start the next round after closing the previous one.
    function openNextRound() external onlyOwner {
        require(!bettingOpen, "close first");
        _openNewRound();
    }

    // ------------------------- Player Actions -------------------------

    /// @notice Place a bet during the betting window.
    function placeBet() external payable {
        require(bettingOpen, "betting closed");
        require(msg.value > 0, "no value");
        Bet storage b = bets[msg.sender];
        require(!b.active, "bet exists");
        b.amountWei = msg.value;
        b.active = true;
        emit BetPlaced(msg.sender, currentRoundId, msg.value);
    }

    /// @notice Cash out at a target multiplier less than or equal to crash.
    /// @param targetX100 Multiplier with 2 decimals (e.g., 250 => 2.50x)
    function cashOut(uint256 targetX100) external {
        require(!bettingOpen, "round live");
        require(crashMultiplierX100 > 0, "no crash yet");
        Bet storage b = bets[msg.sender];
        require(b.active, "no bet");
        require(targetX100 >= minCashoutX100 && targetX100 <= crashMultiplierX100, "bad target");

        uint256 gross = (b.amountWei * targetX100) / 100; // scaled by x100
        uint256 fee = (gross * houseEdgeBps) / 10_000;
        uint256 payout = gross - fee;

        b.active = false;
        b.amountWei = 0;

        // send fee to treasury, payout to player
        if (fee > 0) {
            (bool tf, ) = treasury.call{value: fee}("");
            require(tf, "fee send fail");
        }

        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "payout fail");

        emit CashOut(msg.sender, currentRoundId, targetX100, payout);
    }

    /// @notice If user loses (target above crash), they can clear their bet.
    function forfeitOnCrash() external {
        require(!bettingOpen, "round live");
        require(crashMultiplierX100 > 0, "no crash yet");
        Bet storage b = bets[msg.sender];
        require(b.active, "no bet");
        // If target was above crash, frontend will know; this simply clears.
        b.active = false;
        b.amountWei = 0;
    }
}


