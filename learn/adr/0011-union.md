# 11. Union IBC Bridge

Date: 2024-10-26

## Status

Draft

## Context

### Protocol

The main mode, which always succeeds for any chain, leverages state lenses to create a recursive connection and a communication channel between two chains.

```mermaid
sequenceDiagram
    participant Chain A
    participant Union
    participant Chain B
    critical
        Chain A -->> Chain B: Packet   
        Chain A ->> Union: ClientUpdate
        Union ->> Chain B: ClientUpdate
    end 
    Chain B ->> Union: ClientUpdate
    Union ->> Chain A: ClientUpdate
    Chain B -->> Chain A: Acknowledgement
```

Filler == Union blockchain

```mermaid
sequenceDiagram
    User ->> Chain A: Submit Transfer
    Chain A ->> Union: Observe Locked Assets
    Union ->> Chain B: Provide Assets
    Note over Chain A: Potential Reorg
    Union ->> Chain A: Receive Locked Assets
```

### Recursive connections

`ClientUpdates` leverages a recursive storage proof to fetch the client state held by another chain.
This allows chain B to accept storage proofs over chain A without needing to dispatch packets to Union, reducing query latency.

```mermaid
sequenceDiagram
    participant Chain A
    participant Union
    participant Chain B
    Chain A ->> Union: ClientUpdate
    Union ->> Chain B: ClientUpdate
    Chain B -->> Chain A: Storage Proof
```

## Decision

The change that we're proposing or have agreed to implement.

## Consequences

What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.
