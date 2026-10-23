# Lab architecture

```mermaid
flowchart LR
    Laptop["Student laptop<br/>Local SSH key"]
    Internet((Internet))

    subgraph A[VPC A · 10.10.0.0/16]
        IGW["Internet gateway<br/>ewb-igw-a"]
        subgraph APub[Public subnet · 10.10.1.0/24]
            Bastion["Bastion<br/>10.10.1.10<br/>Public IPv4"]
        end
        subgraph APriv[Private subnet · 10.10.2.0/24]
            AppA["App-A<br/>10.10.2.10<br/>No public IPv4"]
        end
        RTApub["Public routes<br/>10.10.0.0/16 local<br/>0.0.0.0/0 → IGW<br/>10.20.0.0/16 → peering"]
        RTApriv["Private routes<br/>10.10.0.0/16 local<br/>10.20.0.0/16 → peering"]
    end

    subgraph B[VPC B · 10.20.0.0/16]
        subgraph BPriv[Private subnet · 10.20.1.0/24]
            AppB["App-B<br/>10.20.1.10<br/>No public IPv4"]
        end
        RTB["Private routes<br/>10.20.0.0/16 local<br/>10.10.0.0/16 → peering"]
    end

    Laptop -->|SSH 22| Internet
    Internet --> IGW --> Bastion
    Bastion -->|ProxyJump SSH 22| AppA
    Bastion -->|ProxyJump SSH 22| AppB
    AppA <-->|Private traffic| Peer{{VPC peering}}
    Peer <-->|Private traffic| AppB
    RTApub -. routes .-> Bastion
    RTApriv -. routes .-> AppA
    RTB -. routes .-> AppB
```

The bastion has a public address only for laptop administration. App-A and App-B use private IPv4 addresses. Their VPC CIDRs do not overlap, and routes must exist in both directions for peered traffic. VPC B has no internet gateway and cannot use VPC A's internet gateway through peering. Project-specific security groups restrict SSH and ICMP Echo requests to the lab sources described in the [runbook](runbook.md).

