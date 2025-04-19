// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC7715Stream {
    function pauseStream(uint256 streamId) external;
    function getStreamInfo(uint256 streamId) external view returns (
        address sender,
        address recipient,
        uint256 flowRate,
        uint256 startTime,
        bool isPaused
    );
}

contract MaskedGuardian {
    address public owner;
    address public guardian;
    IERC7715Stream public streamContract;

    event SuspiciousActivityDetected(uint256 streamId, uint256 flowRate, string reason);
    event StreamPaused(uint256 streamId);

    constructor(address _streamContract, address _guardian) {
        owner = msg.sender;
        guardian = _guardian;
        streamContract = IERC7715Stream(_streamContract);
    }

    modifier onlyGuardian() {
        require(msg.sender == guardian, "Not authorized");
        _;
    }

    function analyzeAndPause(uint256 streamId) external onlyGuardian {
        (
            , // sender
            , // recipient
            uint256 flowRate,
            ,
            bool isPaused
        ) = streamContract.getStreamInfo(streamId);

        require(!isPaused, "Stream already paused");

        uint256 thresholdRate = 277_777_777_777_777; // 1 ETH/hour

        if (flowRate > thresholdRate) {
            emit SuspiciousActivityDetected(streamId, flowRate, "High flow rate detected");
            streamContract.pauseStream(streamId);
            emit StreamPaused(streamId);
        }
    }
}
