# 4. NFT Transfer

Date: 2024-09-27

## Status

Draft

## Context

We need to move NFT collections from Forma and StarGaze blockchains and store them in the Data Availability layer (Celestia).
In both cases we need to use Hyperlane bridge, but the NFT schemas are different, the first one Forma is a [ERC721](https://github.com/forma-dev/sdk/tree/main/contracts) while the second one StarGaze is a [ICS721](https://github.com/cosmos/ibc/blob/main/spec/app/ics-721-nft-transfer/README.md)

## Decision

Our blockchain is going to work with [EIP-1155](https://eips.ethereum.org/EIPS/eip-721)

### Comparison between EIP-721 and EIP-1155

- ERC-20 require deployment of separate contracts per token type.
- ERC-721 standard’s token ID is a single non-fungible index and the group of these non-fungibles is deployed as a single contract with settings for the entire collection.
- ERC-1155 Multi Token Standard allows for each token ID to represent a new configurable token type, which may have its own metadata, supply and other attributes.

|       Feature        |            EIP-721            |          EIP-1155          |
|:-------------------: |:----------------------------: |:-------------------------: |
| Token type           | Non-fungible (one-of-a-kind)  | Fungible and non-fungible  |
| Ownership            | Single ownership              | Multiple owners possible   |
| Transfers            | One token at a time           | **Batch transfers supported**  |
| Contract complexity  | Simpler                       | More complex               |

### NFT Transfer from StarGaze

```mermaid
flowchart TB
    subgraph SG["StarGaze"]
        subgraph SG_SC["Smart Contracts"]
            SG_CW721["CW-721"]
            subgraph SG_HL["Hyperlane"]
                SG_LOCK["Collateral - Lock"]
                SG_MAIL["Mail"]
                SG_GAS["STAR Gas Pay"]

                SG_MAIL <--> SG_GAS
            end
        end
    end

    subgraph HL_SG["Hyperlane"]
        HL_SG_RY["Hyperlane Relayer"]
        HL_SG_A["Agent A"]
        HL_SG_B["Agent B"]
    end

    subgraph RK["Artela Rollkit"]
         RK_GF["TIA Gas Fee Sequencer"]

        subgraph RK_SC["Smart Contracts"]
            RK_SC_SG_NFT["StarGaze CW721-ERC1155 Adapter"]
            RK_SC_721["ERC1155"]
            subgraph RK_SC_HL_SG["Hyperlane"]
                RK_SC_HL_SG_MINT["Collateral - Mint"]
                RK_SC_HL_SG_MAIL["Mail"]
                RK_SC_HL_SG_ISM["ISM"]

                RK_SC_HL_SG_MAIL <--> RK_SC_HL_SG_ISM
            end
        end
    end

    subgraph Celestia["Celestia Data Availability"]
    end

    SG_CW721 -- Transfer to Artela RK --> SG_LOCK
    SG_LOCK -- Transfer --> SG_MAIL
    SG_MAIL -- Dispatch --> HL_SG_A
    HL_SG_A --> HL_SG_RY
    HL_SG_RY --> HL_SG_B
    HL_SG_B -- Handle --> RK_SC_HL_SG_MAIL
    RK_SC_HL_SG_MAIL --> RK_SC_HL_SG_MINT
    RK_SC_HL_SG_MINT --> RK_SC_SG_NFT
    RK_SC_SG_NFT --> RK_SC_721

    RK_SC_721 --> Celestia

    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    class RK_GF purple
    class RK_SEQ green
    class RK_SC_721 green
```

```mermaid
sequenceDiagram
    participant SG_CW721 as StarGaze CW-721
    participant SG_LOCK as Collateral - Lock
    participant SG_MAIL as Hyperlane Mail (StarGaze)
    participant HL_SG_A as Hyperlane Agent A
    participant HL_SG_RY as Hyperlane Relayer
    participant HL_SG_B as Hyperlane Agent B
    participant RK_SC_HL_SG_MAIL as Hyperlane Mail (Artela)
    participant RK_SC_HL_SG_MINT as Collateral - Mint (Artela)
    participant RK_SC_SG_NFT as CW721-ERC1155 Adapter
    participant RK_SC_721 as ERC1155 (Artela)
    participant Celestia as Celestia Data Availability

    SG_CW721->>SG_LOCK: Lock
    SG_LOCK->>SG_MAIL: Transfer
    SG_MAIL->>HL_SG_A: Dispatch
    HL_SG_A->>HL_SG_RY: Forward
    HL_SG_RY->>HL_SG_B: Forward
    HL_SG_B->>RK_SC_HL_SG_MAIL: Handle
    RK_SC_HL_SG_MAIL->>RK_SC_HL_SG_MINT: Mint
    RK_SC_HL_SG_MINT->>RK_SC_SG_NFT: Create Adapter
    RK_SC_SG_NFT->>RK_SC_721: Transfer
    RK_SC_721->>Celestia: Data Availability
```

## **Stargaze Tasks**

- Lazy TIA **ERC1155** smart contract using Solidity
  - [Forma 721](https://github.com/forma-dev/sdk/tree/main/contracts)
  - Receive ok / Refund is handle by Hyperlane bridge?
- Define warp routes for Hyperlane Bridge
  - [deploy-warp-route](https://docs.hyperlane.xyz/docs/guides/deploy-warp-route})
  - [Submit to Registry](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md)
- Create a Bridge UI for NFT
  - [deploy-warp-route-UI](https://docs.hyperlane.xyz/docs/guides/deploy-warp-route-UI#fork--customize-the-ui)
  - [Example](https://github.com/forma-dev/hyperlane-bridge-ui)

### NFT Transfer from FORMA

```mermaid
flowchart TB
    subgraph FM["Forma"]
        subgraph FM_SC["Smart Contracts"]
            FM_ERC721["ERC1155"]
            subgraph FM_HL["Hyperlane"]
                FM_LOCK["Collateral - Lock"]
                FM_MAIL["Mail"]
                FM_GAS["F-TIA Gas Pay"]

                FM_MAIL <--> FM_GAS
            end
        end
    end

    subgraph HL_FM["Hyperlane"]
        HL_FM_RY["Hyperlane Relayer"]
        HL_FM_A["Agent A"]
        HL_FM_B["Agent B"]
    end

    subgraph RK["Artela Rollkit"]
         RK_GF["TIA Gas Fee Sequencer"]

        subgraph RK_SC["Smart Contracts"]
            RK_SC_FM_NFT["Forma ERC1155-ERC1155 Adapter"]
            RK_SC_721["ERC1155"]
            subgraph RK_SC_HL_FM["Hyperlane"]
                RK_SC_HL_FM_MINT["Collateral - Mint"]
                RK_SC_HL_FM_MAIL["Mail"]
                RK_SC_HL_FM_ISM["ISM"]

                RK_SC_HL_FM_MAIL <--> RK_SC_HL_FM_ISM
            end
        end
    end

    subgraph Celestia["Celestia Data Availability"]
    end

    FM_ERC721 -- Transfer to Artela RK --> FM_LOCK
    FM_LOCK -- Transfer --> FM_MAIL
    FM_MAIL -- Dispatch --> HL_FM_A
    HL_FM_A --> HL_FM_RY
    HL_FM_RY --> HL_FM_B
    HL_FM_B -- Handle --> RK_SC_HL_FM_MAIL
    RK_SC_HL_FM_MAIL --> RK_SC_HL_FM_MINT
    RK_SC_HL_FM_MINT --> RK_SC_FM_NFT
    RK_SC_FM_NFT --> RK_SC_721

    RK_SC_721 --> Celestia

    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    class RK_GF purple
    class RK_SEQ green
    class RK_SC_721 green
```

```mermaid
sequenceDiagram
    participant FM_ERC721 as Forma ERC1155
    participant FM_LOCK as Collateral - Lock
    participant FM_MAIL as Hyperlane Mail (Forma)
    participant HL_FM_A as Hyperlane Agent A
    participant HL_FM_RY as Hyperlane Relayer
    participant HL_FM_B as Hyperlane Agent B
    participant RK_SC_HL_FM_MAIL as Hyperlane Mail (Artela)
    participant RK_SC_HL_FM_MINT as Collateral - Mint (Artela)
    participant RK_SC_FM_NFT as Forma ERC1155-ERC1155 Adapter
    participant RK_SC_721 as ERC1155 (Artela)
    participant Celestia as Celestia Data Availability

    FM_ERC721->>FM_LOCK: Lock
    FM_LOCK->>FM_MAIL: Transfer
    FM_MAIL->>HL_FM_A: Dispatch
    HL_FM_A->>HL_FM_RY: Forward
    HL_FM_RY->>HL_FM_B: Forward
    HL_FM_B->>RK_SC_HL_FM_MAIL: Handle
    RK_SC_HL_FM_MAIL->>RK_SC_HL_FM_MINT: Mint
    RK_SC_HL_FM_MINT->>RK_SC_FM_NFT: Create Adapter
    RK_SC_FM_NFT->>RK_SC_721: Transfer
    RK_SC_721->>Celestia: Data Availability
```

### **Forma Tasks**

- Lazy TIA **ERC1155** smart contract using Solidity
  - [Forma 721](https://github.com/forma-dev/sdk/tree/main/contracts)
  - Receive ok / Refund is handle by Hyperlane bridge?
- Define warp routes for Hyperlane Bridge
  - [deploy-warp-route](https://docs.hyperlane.xyz/docs/guides/deploy-warp-route})
  - [Submit to Registry](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md)
- Create a Bridge UI for NFT
  - [deploy-warp-route-UI](https://docs.hyperlane.xyz/docs/guides/deploy-warp-route-UI#fork--customize-the-ui)
  - [Example](https://github.com/forma-dev/hyperlane-bridge-ui)

## Consequences

We will adopt [EIP1155](https://eips.ethereum.org/EIPS/eip-1155) as nft specs.
