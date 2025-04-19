// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockStream {
    struct Stream {
        address sender;
        address recipient;
        uint256 flowRate;
        uint256 startTime;
        bool isPaused;
    }

    mapping(uint256 => Stream) public streams;

    function createStream(uint256 streamId, address recipient, uint256 flowRate) external {
        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            flowRate: flowRate,
            startTime: block.timestamp,
            isPaused: false
        });
    }

    function pauseStream(uint256 streamId) external {
        streams[streamId].isPaused = true;
    }

    function getStreamInfo(uint256 streamId) external view returns (
        address sender,
        address recipient,
        uint256 flowRate,
        uint256 startTime,
        bool isPaused
    ) {
        Stream memory s = streams[streamId];
        return (s.sender, s.recipient, s.flowRate, s.startTime, s.isPaused);
    }

    function isStreamPaused(uint256 streamId) external view returns (bool) {
        return streams[streamId].isPaused;
    }
}
