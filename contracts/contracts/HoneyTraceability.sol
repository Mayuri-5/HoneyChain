// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HoneyTraceability {
    struct Batch {
        string batchId;
        string hiveId;
        address beekeeper;
        uint64 harvestTimestamp;
        bytes32 canonicalDataHash;
        bool active;
    }

    struct TraceabilityEvent {
        string eventType;
        bytes32 dataHash;
        address actor;
        uint64 timestamp;
    }

    mapping(bytes32 => Batch) private batches;
    mapping(bytes32 => TraceabilityEvent[]) private traceabilityEvents;

    event BatchRegistered(
        string indexed batchId,
        string hiveId,
        address indexed beekeeper,
        uint256 harvestTimestamp,
        bytes32 canonicalDataHash
    );

    event TraceabilityEventRecorded(
        string indexed batchId,
        string eventType,
        bytes32 dataHash,
        address indexed actor,
        uint256 timestamp
    );

    event QualityVerified(
        string indexed batchId,
        bytes32 dataHash,
        address indexed actor,
        uint256 timestamp
    );

    event ProcessingRecorded(
        string indexed batchId,
        bytes32 dataHash,
        address indexed actor,
        uint256 timestamp
    );

    event CustodyEventRecorded(
        string indexed batchId,
        bytes32 dataHash,
        address indexed actor,
        uint256 timestamp
    );

    function registerBatch(
        string calldata batchId,
        string calldata hiveId,
        uint64 harvestTimestamp,
        bytes32 canonicalDataHash
    ) external {
        bytes32 batchKey = _batchKey(batchId);
        require(bytes(batchId).length > 0, "batch id required");
        require(!batches[batchKey].active, "batch already registered");

        batches[batchKey] = Batch({
            batchId: batchId,
            hiveId: hiveId,
            beekeeper: msg.sender,
            harvestTimestamp: harvestTimestamp,
            canonicalDataHash: canonicalDataHash,
            active: true
        });

        emit BatchRegistered(
            batchId,
            hiveId,
            msg.sender,
            harvestTimestamp,
            canonicalDataHash
        );
    }

    function recordTraceabilityEvent(
        string calldata batchId,
        string calldata eventType,
        bytes32 dataHash
    ) external {
        _recordEvent(batchId, eventType, dataHash);
    }

    function recordQualityVerification(
        string calldata batchId,
        bytes32 dataHash
    ) external {
        _recordEvent(batchId, "QUALITY_VERIFIED", dataHash);
        emit QualityVerified(batchId, dataHash, msg.sender, block.timestamp);
    }

    function recordProcessing(
        string calldata batchId,
        bytes32 dataHash
    ) external {
        _recordEvent(batchId, "PROCESSED_PACKAGED", dataHash);
        emit ProcessingRecorded(batchId, dataHash, msg.sender, block.timestamp);
    }

    function recordCustodyEvent(
        string calldata batchId,
        string calldata eventType,
        bytes32 dataHash
    ) external {
        _recordEvent(batchId, eventType, dataHash);
        emit CustodyEventRecorded(batchId, dataHash, msg.sender, block.timestamp);
    }

    function getBatch(string calldata batchId) external view returns (Batch memory) {
        return batches[_batchKey(batchId)];
    }

    function getTraceabilityEvents(
        string calldata batchId
    ) external view returns (TraceabilityEvent[] memory) {
        return traceabilityEvents[_batchKey(batchId)];
    }

    function _recordEvent(
        string calldata batchId,
        string memory eventType,
        bytes32 dataHash
    ) internal {
        bytes32 batchKey = _batchKey(batchId);
        require(batches[batchKey].active, "batch not registered");

        traceabilityEvents[batchKey].push(
            TraceabilityEvent({
                eventType: eventType,
                dataHash: dataHash,
                actor: msg.sender,
                timestamp: uint64(block.timestamp)
            })
        );

        emit TraceabilityEventRecorded(
            batchId,
            eventType,
            dataHash,
            msg.sender,
            block.timestamp
        );
    }

    function _batchKey(string memory batchId) private pure returns (bytes32) {
        return keccak256(bytes(batchId));
    }
}