# Design

## Context

Celestine Sloth Society wants to have his own blockchain to evolve his main product NFT collection.
We are going to use a **modular blockchain** using **Sovereign Rollups** using Artela EVM++ as **Execution Layer**, **Rollkit** as **Settlement and consensus** layer (**cometBFT**) and **Celestia** as **Data Availability** layer.

## Main Goal

- Create a **modular blockchain** using **Sovereign Rollups** using Artela EVM++ as **Execution Layer**, **Rollkit** as **Settlement and consensus** layer (**cometBFT**) and **Celestia** as **Data Availability** layer.
- Transfer NFT Collections from other blockchains.
- Allow users to Stake their NFT.

## Sub Goals

- The system should be distributed, secure and scalable.

### Links

- [Forma Bridge](https://www.stride.zone/blog/stride-s-hyperlane-bridge-deployment-is-live-bridge-tia-to-forma)
- [Forma sdk](https://github.com/forma-dev/sdk/tree/main/contracts)
- [Celestia](https://celestia.org/what-is-celestia/)
- [RollKit](https://rollkit.dev/tutorials/artela-evm-plus-plus)
- [Hyperlane](https://docs.hyperlane.xyz/docs/deploy-hyperlane)
- [Artela](https://docs.artela.network/develop)

### Design ADRs

- [Gas Bridge (Celestia TIA - Lazy TIA)](../adr/0003-base-token.md)
- [NFT Transfer](../adr/0004-nft-transfer.md)
  
#### Data Availability Flow

```mermaid
flowchart TB
    User["User"]

    subgraph Frontend["lazy.fun"]
        subgraph RKC["Rollkit Client"]
            RKC_A["Client"] 
            RKC_B["go-da"] 

            RKC_A-- "Message" -->RKC_B
        end
        Proxy["Web Proxy/Balancer"]
        UI["Web Interface"]

        Proxy --> UI
        
    end

    subgraph RK["Artela Rollkit"]
        RK_LN["Light Node"]
        RK_FN["Full Node"]
        RK_SEQ["Sequencer (Aggregator)"]
        RK_RB["Rollup Block"]
        RK_ST["Rollup State"]
        RK_GF["TIA Gas Fee Sequencer"]

        subgraph RK_SC["Smart Contracts"]
            RK_SC_721["NFT"]
        end
    end

    subgraph Celestia["Celestia Data Availability"]
        CL_LN["Celestia Light Node"]
        CL_BN["Celestia Bridge Node"] 
        CL_FN["Celestia Full Storage Node"]

        CL_LN-- "Store Data Call" --> CL_BN
        CL_BN-- "celestia-app" -->CL_FN
    end

    User -- Interact --> Proxy
    UI --1 Submit Tx--> RKC
    RKC -- 2 Submit --> RK_LN
    RK_LN -- 3 Gossip --> RK_FN
    RK_FN -- 4 Notify Tx --> RK_SEQ
    RK_SEQ -- 5 Add Tx -->RK_RB
    RK_FN -- 6 Update --> RK_ST
    RK_FN -- 7 OK --> RK_LN
    RK_LN --  8 OK --> RKC
    RK_SEQ -- 9 Send Rollup Block -->CL_LN
    RK_FN -- 10 Download and Validate Block --> CL_FN

    classDef green fill:#696,stroke:#333;
    classDef purple fill:#969,stroke:#333;
    class RK_GF purple
    class RK_SEQ green
    class RK_SC_721 green
```

::: warning
Add sequence diagram
Research what tasks do we need here?
:::

#### NFT ERC1155

::: warning
Add functions flowchart
:::

#### STAKE

```mermaid
flowchart TB
    User["User"]
    Admin["Admin"]

    subgraph Frontend["lazy.fun"]
        subgraph RKC["Rollkit Client"]
            RKC_A["Client"] 
            RKC_B["go-da"] 

            RKC_A-- "Message" -->RKC_B
        end
        Proxy["Web Proxy/Balancer"]
        UI["Web Interface"]

        Proxy --> UI
        
    end

    subgraph RK["Artela Rollkit"]
        subgraph RK_SC["Smart Contracts"]
            RK_SC_721["ERC1155"]
            RK_SC_721_STAKE["Stake/unstake"]
        end
    end

    subgraph Celestia["Celestia Data Availability"]
    end

    User -- Stake [Period] / Unstake --> Proxy
    UI --1 Submit Tx--> RKC
    RKC -- 2 Submit --> RK_SC_721
    RK_SC_721 -- Send [Lock Period] --> RK_SC_721_STAKE
    RK_SC_721_STAKE --> Celestia
```

> **Tasks**

- Solidity Smart contract [cw-nft-staking](https://github.com/Lazychain/cw-nft-staking)
- Web UI [nft-staking-app](https://github.com/thirdweb-example/nft-staking-app)

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

    subgraph RK["Rollkit"]
        RK_LN["Light Node"]
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

```mermaid
flowchart LR
```

> **Tasks**

#### Faucet

- [faucet-frontend](https://github.com/artela-network/faucet-frontend)

```mermaid
flowchart LR
```

#### Explorer

- [block-explorer](https://github.com/artela-network/block-explorer)
- [block-explorer-frontend](https://github.com/artela-network/block-explorer-frontend)

```mermaid
flowchart LR
```

#### Dashboard

- [evm-dashboard](https://github.com/artela-network/evm-dashboard)
