# 3. Base token

Date: 2024-09-27

## Status

Draft

## Context

We need to pay Gas Fee for using the Data Availability layer (Celestia). For the release of this new, we cannot use **IBC** since **ibc light clients** can't check proofs is the blockchain is not an L1.

## Decision

We are going to use [Hyperlane bridge](https://docs.hyperlane.xyz/docs/intro) to transfer TIA from Celestia to our new blockchain.

Hyperlane uses **IBC** to transfer **TIA** (ICS Native token) into a Hyperlane **Voucher TIA** ([ICS-20](https://github.com/cosmos/ibc/blob/main/spec/app/ics-020-fungible-token-transfer/README.md)).
Later we can bridge (lock hyperlane voucher TIA) the TIA tokens into this new chain (mint [EIP-20](https://eips.ethereum.org/EIPS/eip-20))

### Gas Bridge (Celestia TIA - Lazy TIA)

```mermaid
---
title: Gas Bridge (Celestia TIA - Lazy TIA)
---
flowchart TB
    %% OC origin chain
    subgraph OC["Celestia Chain"]
        OC_NT["Native Token"]
        OC_IBC_LC["IBC Light Client"]
    end

    %% DC Destination chain
    subgraph DC["Lazy Chain"]
        subgraph DC_FE["UI Web Bridge"]
            DC_FE_UI["Celestia TIA <-> Lazy TIA"]
        end
        subgraph DC_SC["Smart Contracts"]
            DC_ERC20["Lazy Native TIA"]
            subgraph DC_HL["Hyperlane"]
                DC_MINT["Collateral - Mint"]
                DC_MAIL["Mail"]
                DC_ISM["ISM"]

                DC_MAIL <--> DC_ISM
                DC_MAIL <--> DC_MINT
            end
        end

    end

    %% IC intermediate chain
    subgraph IC["Stride Chain"]
        IC_ICS20["Voucher TIA"]
        IC_IBC_LC["IBC Light Client"]
        subgraph IC_HL["Hyperlane"]
            IC_LOCK["Voucher TIA Collateral - Lock"]
            IC_MAIL["Mail"]
            IC_GAS["TIA Gas Pay"]

            IC_MAIL <--> IC_GAS
            IC_MAIL <--> IC_LOCK
        end
    end

    subgraph IBC["IBC"]
        IBC_RL["Relayer"]
    end

    subgraph HL["Hyperlane Bridge"]
        HL_RY["Hyperlane Relayer"]
        HL_A["Agent A"]
        HL_B["Agent B"]
    end

    OC_NT -- 1- Lock TIA --> IBC_RL
    IBC_RL -- 2- Mint TIA Voucher --> IC_ICS20
    OC_IBC_LC -- Chains state --> IC_IBC_LC

    IC_ICS20 -- 3- Send --> IC_MAIL
    IC_MAIL -- 4- Dispatch --> HL_A
    HL_A --> HL_RY
    HL_RY --> HL_B
    HL_B -- 5- Handle --> DC_MAIL
    DC_MAIL -- 6- Receive --> DC_ERC20
```

```mermaid
sequenceDiagram
    participant CL as Celestia
    participant IBC_RL as IBC Relayer
    participant ST_ICS20 as Strider
    participant IC_MAIL as Hyperlane Mail
    participant HL_A as Hyperlane Agent A
    participant HL_RY as Hyperlane Relayer
    participant HL_B as Hyperlane Agent B
    participant DC_MAIL as Hyperlane Mail
    participant DC_ERC20 as Lazy

    CL->>IBC_RL: Lock Native TIA (ICS20)
    IBC_RL->>ST_ICS20: Mint TIA Voucher (ICS20)
    ST_ICS20->>IC_MAIL: Send
    IC_MAIL->>HL_A: Dispatch
    HL_A->>HL_RY: Forward
    HL_RY->>HL_B: Forward
    HL_B->>DC_MAIL: Handle
    DC_MAIL->>DC_ERC20: Mint TIA (ERC20)
```

### Tasks

- Lazy TIA **ERC20** smart contract using Solidity
  - Receive ok / Refund is handle by Hyperlane bridge?
- Define warp routes for Hyperlane Bridge
  - [deploy-warp-route](https://docs.hyperlane.xyz/docs/guides/deploy-warp-route})
  - [Submit to Registry](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md)
- Create a Bridge UI
  - [deploy-warp-route-UI](https://docs.hyperlane.xyz/docs/guides/deploy-warp-route-UI#fork--customize-the-ui)
  - [Example](https://github.com/forma-dev/hyperlane-bridge-ui)

## Consequences

- This make Celestia the default DA layer.
- Out TIA token would be [ERC20](https://eips.ethereum.org/EIPS/eip-20).
