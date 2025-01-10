# Astria Design

## Context

Celestine Sloth Society wants to have his own blockchain to evolve his main product NFT collection.
We are going to investigate Astria to create a **modular blockchain** using **Sovereign Rollups** using Geth as **Execution Layer**, **Astria** as **Settlement and consensus** layer (**cometBFT**, **decentralized sequencing**) and **Celestia** as **Data Availability** layer.

## Main Goal

- Create a **modular blockchain** using **Sovereign Rollups** using Geth as **Execution Layer**, **Astria** as **Settlement and consensus** layer (**cometBFT**) and **Celestia** as **Data Availability** layer.
- Transfer NFT Collections from other blockchains.
- Allow users to Stake their NFT.

## Sub Goals

- The system should be distributed, secure and scalable.

### Links

- [Celestia](https://celestia.org/what-is-celestia/)
- [Geth](https://Geth.rs/)
  - [Geth Node](https://github.com/astriaorg/Geth)
- [Astria](https://www.astria.org/)
  - [Rollup Node](https://github.com/astriaorg/astria-geth)
  - [Decentralized Sequencer](https://docs.astria.org/overview/components/the-astria-sequencing-layer)
    - [Composer](https://docs.astria.org/overview/components/composer)
    - [Relayer](https://docs.astria.org/overview/components/relayer)
    - [Conductor](https://docs.astria.org/overview/components/conductor)

### Architecture

- **Composer**: The Composer can be described as a "gas station", underwriting the sequencing costs for users' rollup transactions. This allows order-agnostic users to simply pay for transaction execution in the rollup's native gas token without needing to maintain a sequencer wallet, as long as the operator keeps the Composer funded.
- **Astria Sequencing Layer**: `Astria blockchain` CometBFT consensus algorithm.  It primarily orders transactions without executing them, as they are intended for execution on rollups. However, it does execute "sequencer native" transactions like token transfers within the sequencer chain.
- **Relayer**: Fetch validated blocks from the sequencer and pass them along to the DA layer
- **Data Availability Layer**: `Celestia` blockchain.
- **Conductor**: Its role is to connect the sequencer and Data Availability layers to the rollup execution layer by extracting the transactions belonging to the rollup node from each sequencer block, and forwarding them to the execution layer.

```mermaid
flowchart LR
    subgraph RollUp["RollUp Full Node"]
        subgraph Runtime["Execution Layer"]
            C[LazyChain]
        end
        G[Conductor]
    end
    subgraph Concensus["Concensus Layer"]
        E[Astria Shared Sequencer]
    end

    D{Astria Composer}
    F[Astria Relayer]

    subgraph Persistence["Persistence Layer"]
        H[Celestia]
    end
    
    C -- Send Tx --> D
    D -- Gas Expenses and Txs --> E
    E -- Relay --> F
    F -- Fetch validated blocks to Persist --> H

    H -- Update Persisted State --> G
    E -- Notify Update State --> G
    G -- Update State --> C 

    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    classDef orange fill:#f96
    classDef blue fill:#303
    classDef bar stroke:#0f0
    class E blue
    class C green
    class H purple
    class G bar

```

A rollup light node needs to:

1. Implement an L1 consensus light client
2. Implement an L2 consensus light client
3. Ensure that the transaction data for each L2 block was published

A light node of a rollup that uses a sequencing layer needs to verify the consensus of the sequencer chain, as the sequencer acts as the equivalent of the L1 - i.e. it’s where transaction inclusion and ordering is finalized.

It needs to follow the headers and verify consensus of the sequencer chain. Since light nodes don’t store the blockchain state, to verify if a rollup transaction was included in some rollup block X, the light node first needs a Merkle proof that the rollup transaction was included in the transactions/data root of some sequencer chain header.

Then, if it follows that rollup block X was derived from sequencer block Y (using the rollup derivation function), it knows that the transaction should be included in rollup block X.

The light node also needs to check that the block data was published, which it can do via data availability sampling (for example, when using Celestia).

#### Data Availability Flow

```mermaid
flowchart TB
    User["User"]

    subgraph Frontend["lazy.fun"]
        subgraph RKC["RollUp Client"]
            RKC_A["Client"] 
            RKC_B["go-da"] 
            RKC_A-- "Message" -->RKC_B
        end
        Proxy["Web Proxy/Balancer"]
        UI["Web Interface"]
        Proxy --> UI
    end

    subgraph RollUp["RollUp Full Node"]
        subgraph C["LazyChain"]
            subgraph RU_SC["Smart Contracts"]
                RK_SC_721["NFT"]
            end
        end
        G[Conductor]
    end
    subgraph Concensus["Concensus Layer"]
        E[Shared Sequencer]
    end

    D{Composer}
    F[Relayer]

    subgraph Celestia["Celestia Data Availability"]
        CL_LN["Celestia Light Node"]
        CL_BN["Celestia Bridge Node"] 
        CL_FN["Celestia Full Storage Node"]

        CL_LN-- "Store Data Call" --> CL_BN
        CL_BN-- "celestia-app" -->CL_FN
    end

    User -- Interact --> Proxy
    UI --1 Submit Tx--> RKC
    RKC -- 2 Submit --> C
    C -- 4 Notify Tx --> D
    D -- 5 Add Tx -->E
    E -- 6 Relay --> F
    F -- 7 Fetch validated blocks to Persist --> Celestia
    Celestia -- 8 Update Persisted State --> G
    E -- 8 Notify Update State --> G
    G -- Update State --> C 

    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    classDef orange fill:#f96
    classDef bar stroke:#0f0
    classDef blue fill:#303
    class RK_GF purple
    class RK_SEQ green
    class RK_SC_721 green
    class E blue
    class G bar
```

#### Bridging TIA to Lazychain

- Single Fee Token:
  - Bridge DA Token to Sequencer
  - Bridge DA Token to Rollup

##### From Celestia to Astria (IBC)

```mermaid
---
title: TIA Bridge
---
flowchart LR
    subgraph DAS["Celestia Data Availability"]
        CL_LN["Celestia Light Node"]
        CL_BN["Celestia Bridge Node"] 
        CL_FN["Celestia Full Storage Node"]
        CL_IBC["IBC Light Client"]
        CL_TOKEN["TIA"]

        CL_LN-- "Store Data Call" --> CL_BN
        CL_BN-- "celestia-app" -->CL_FN
    end

    subgraph IBC["IBC Relayer"]
        direction LR
    end

    subgraph AS["Astria"]
        direction LR
        E[Shared Sequencer]
        D[Composer]
        AS_IBC["IBC Light Client"]
        AS_TOKEN["V_TIA"]
    end

    X[Celestia] --> Y[IBC-Enabled]
    Y --> Z[Bridge TIA to Astria]


    CL_IBC <-- State changes proofs --> IBC
    IBC <-- State changes proofs --> AS_IBC

    CL_TOKEN -- App:Channel:Connection --> IBC
    IBC -- App:Channel:Connection --> AS_TOKEN

    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    class CL_TOKEN purple
    class AS_TOKEN purple
    class IBC green
```

#### From Celestia to Lazychain

```mermaid
flowchart LR
    subgraph Rollup["LazyChain"]
        L2_1["Block"]
        L2_2["Block+1"]
        L2_3["Block+2"]
    end

    subgraph Celestia["Celestia"]
        CL_TIA["Lazy account TIA"]
    end

    subgraph Astria["Astria"]
        AS_TIA["Lazy escrow account uTIA"]
        AS_CN["Astria(Lazy) Consensus"]

        AS_CN -- Monitor --> AS_TIA
    end


    subgraph IBC["IBC"]
        Port["Astria Port"]
    end

    CL_TIA -- Send Deposit --> IBC
    IBC -- Transmit Deposit --> AS_TIA

    AS_CN --> L2_1
    L2_1 -- Deposit --> L2_2
    L2_2 --  Mint Synthetic Transaction --> L2_3


    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    class AS_CN purple
    class IBC green
```

From `Celestia`, tokens are transferred to some escrow account/contract on `Astria` via `IBC`.
The `Lazy rollup consensus` node, which derives transactions from `Astria` data, `sees` these deposits on the `Lazy scrow account on Astria`, and includes a corresponding `deposit` transaction in the **next** `Lazy` block, which is a distinct transaction type.
The `Lazy` node executes these deposit transactions, minting synthetic funds on the `Lazy` to the respective account.

#### From lazy to Celestia

```mermaid
flowchart RL
    subgraph Rollup["LazyChain"]
        L2_1["Block"]
        L2_2["Block+n"]
        L2_3["Block+n+1"]
    end

    subgraph Celestia["Celestia"]
        CL_TIA["Lazy account TIA"]
    end

    subgraph Astria["Astria"]
        AS_TIA["Lazy escrow account uTIA"]
        subgraph AS_CN["Astria(Lazy) Consensus"]
            AS_CN_VE['Verify']
            AS_CN_PE['Pending']
            AS_CN_EX['Execution']
        end

        AS_CN_EX -- Withdraw --> AS_TIA
    end

    subgraph IBC["IBC"]
        Port["Astria Port"]
    end

    IBC -- Withdraw --> CL_TIA
    AS_TIA -- Transmit Withdraw --> IBC

    L2_1 -- Withdraw --> AS_CN_PE
    AS_CN_PE --> AS_CN_VE
    AS_CN_VE -- Optimistic / ZK Validation --> L2_1
    AS_CN_VE --> AS_CN_EX
    AS_CN_EX --> L2_2
    L2_2 --  Burn Synthetic Transaction --> L2_3


    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    class AS_CN purple
    class IBC green
```

From `Lazy` to `Celestia Lazy account` requires proving rollup block state roots on `Astria`.
This is the “optimistic” or “ZK” parts of the rollup.
To implement bridging from `Lazy Rollup` back to the `Astria sequencer` or `DA network`, we need to add functionality to verify `Lazy rollup state` rollups on `Astria` or `Celestia`.
On the `Astria sequencer`, this would mean enshrining some sort of state root verification actor in the sequencer’s state machine, which could be instantiated by the rollup and used to bridge to the `sequencer/ Lazy Concensus`. 
Since we’re using `Celestia` as DA, which does not support any sort of programmability, the only way to bridge from the rollup to Celestia would be first through the `Astria sequencer`, then back to `Celestia` through IBC.




#### NFT Transfer from StarGaze using IBC

```mermaid
flowchart TB
    subgraph SG["StarGaze"]
        SG_IBC_LC["IBC Light Client"]
        subgraph SG_SC["Smart Contracts"]
            subgraph SG_CW721_ROYALTY["CW-721-Royalty"]
                SG_CW721_ROYALTY_OWNER["Owner"]
            end
            subgraph SG_CW721["CW-721-BASE"]
                SG_CW721_LOCK["LOCK"]
                SG_CW721_MINT["MINT"]
            end
        end
    end

    IBC["IBC Relayer"]

    subgraph LZ["LazyChain"]
         LZ_IBC_LC["IBC Light Client"]
        subgraph LZ_SC["Smart Contracts"]
            subgraph LZ_CW721_ADAPTER["ERC721 Royalty"]
                LZ_CW721_ROYALTY_OWNER["Owner"]
            end
            subgraph LZ_CW721["ERC721-BASE"]
                LZ_CW721_LOCK["LOCK"]
                LZ_CW721_MINT["MINT"]
            end
        end
    end

    SG_CW721_ROYALTY -- Transfer / Adapt --> SG_CW721 
    SG_CW721 --> SG_CW721_LOCK
    SG_CW721_LOCK -- App:Channel:Connection --> IBC
    IBC -- App:Channel:Connection --> LZ_CW721_MINT
    LZ_CW721_MINT -- Transfer / Adapt --> LZ_CW721_ADAPTER
    LZ_IBC_LC <-- State changes proofs --> IBC
    SG_IBC_LC <-- State changes proofs --> IBC


    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    class LZ_IBC_LC purple
    class SG_IBC_LC purple
    class IBC green
```

#### STAKE

```mermaid
flowchart TB
    User["User"]

    subgraph Frontend["lazy.fun Web Page"]
        subgraph RKC["Rollup Client"]
            RKC_A["Sdk Client"] 
        end
        Proxy["Web Proxy/Balancer"]
        UI["Web Interface"]

        Proxy --> UI
        
    end

    subgraph RK["LazyChain RollUp"]
        subgraph RK_SC["Smart Contracts"]
            RK_SC_721["ERC721"]
            RK_SC_721_STAKE["Stake/unstake"]
        end
    end

    subgraph Celestia["Celestia Data Availability"]
    end

    subgraph Astria["Astria Stack"]
        Composer --> Concensus
        Concensus --> Condutor


    end

    User -- Stake [Period] / Unstake --> Proxy
    UI --1 Submit Tx --> RKC
    RKC -- 2 Submit --> RK_SC_721
    RK_SC_721 -- Send [Lock Period] --> RK_SC_721_STAKE
    RK_SC_721_STAKE --> Composer 
    Celestia <--> Astria
    Condutor --> RK
```

#### Tasks

> **Tasks**

- Create a Bridge UI for NFT
  - Integrate Front end Flame webapp using [astria-bridge-web-app](https://github.com/astriaorg/astria-bridge-web-app)
- Run and create `Geth` node for lazyChain.
  - Deploy lazy smart contracts ERC1155 and ERC721.
  - Create contract adapters to apply `Royalty` to `ERC721` and `CW721` and reversal.
- Run `Conductor` for `Geth`?

#### Monitoring

```mermaid
flowchart LR
    Admin["Admin"]
    TG["Telegram"]
    DC["Discord"]

    subgraph MN["Range"]
        MN_UI["Setup/Admin"]
        MN_SC["Service"]
    end

    subgraph RK["RollUp"]
        RK_LN["LazyChain Node"]
    end

    MN_SC <-- Status --> RK_LN
    MN_SC -- Alarms --> TG
    MN_SC -- Alarms --> DC
    Admin --> MN_UI
```

> **Tasks**

- Create account into Range
- Setup Telegram and Discord Alarms
- Setup Service backend (RPC)

#### Oracle Sidecar

- [oracle-client](https://docs.skip.build/connect/developers/integration#oracle-client)

> **Tasks**

#### Faucet

- [faucet](https://github.com/Lazychain/eth-faucet)

#### Explorer

- [blockscout](https://github.com/blockscout/blockscout)
- [blockscout-frontend](https://github.com/Lazychain/blockscout-frontend)

#### Frontend Bridge

- [astria-bridge-web-app](https://github.com/astriaorg/astria-bridge-web-app)
