# [Your Name] — EWB AWS VPC Peering

**Batch:** [Batch]  
**AWS Region:** [Region]  
**Completion date:** [Date]

> Replace every bracketed placeholder and add your own screenshots and measured results. This template contains no execution evidence.

## 1. Architecture and purpose

[Insert your diagram or a labeled screenshot. Explain that App-A and App-B use private addresses and the bastion is the sole public administration entry point.]

## 2. Resource inventory

| Resource | Name | AWS ID | CIDR or private IP | Public IPv4 |
| --- | --- | --- | --- | --- |
| VPC A | ewb-vpc-a | [ID] | 10.10.0.0/16 | — |
| VPC B | ewb-vpc-b | [ID] | 10.20.0.0/16 | — |
| Public subnet A | ewb-a-public | [ID] | 10.10.1.0/24 | — |
| Private subnet A | ewb-a-private | [ID] | 10.10.2.0/24 | — |
| Private subnet B | ewb-b-private | [ID] | 10.20.1.0/24 | — |
| Bastion | ewb-bastion | [ID] | 10.10.1.10 | [Address] |
| App-A | ewb-app-a | [ID] | 10.10.2.10 | None |
| App-B | ewb-app-b | [ID] | 10.20.1.10 | None |
| Peering | ewb-a-b-peer | [pcx-ID] | Active | — |

## 3. Routing and security

[Add screenshots showing the three route table subnet associations and routes. Explain the VPC A to VPC B forward path and the return route.]

[Record the inbound rules for ewb-sg-bastion, ewb-sg-app-a, and ewb-sg-app-b. Confirm SSH is not open to 0.0.0.0/0.]

## 4. Test evidence

For every item, include a screenshot labeled with host, command/action, and observed result.

| Test | Evidence and actual result |
| --- | --- |
| App-A to App-B ping before peering | [Attach evidence; record actual output] |
| App-A to App-B ping after peering | [Attach evidence; record actual output] |
| App-B to App-A ping after peering | [Attach evidence; record actual output] |
| `ssh ewb-app-b` through bastion | [Attach evidence; identify App-B] |
| App-A to App-B ping after removing App-B ICMP rule | [Attach evidence; record actual output] |
| Ping after restoring the ICMP rule | [Attach evidence; record actual output] |
| App-A and App-B have no public IPv4 | [Attach EC2 console evidence] |

## 5. Explanation and learning

**Why is a return route needed?** [Your explanation]

**Why does App-B see the bastion private IP as the SSH source?** [Your explanation]

**Why does Active peering alone not guarantee a successful ping?** [Your explanation]

**Can VPC B use VPC A's internet gateway over peering?** [Your explanation]

**What did you learn?** [Short reflection]

## 6. Cleanup

[Attach evidence that the lab instances, storage, VPC networking resources, and any public IP allocations were removed. Note any remaining usage you checked in Billing.]

