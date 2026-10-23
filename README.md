# EWB AWS VPC Peering Lab

Reproducible Terraform implementation of the attached EWB Courses student project. It creates two non-overlapping VPCs, three explicitly routed subnets, one internet-facing bastion, two private Amazon Linux 2023 workloads, and an active VPC peering connection.

## Before deploying

- Use an AWS lab account and Region where you are allowed to create VPC, EC2, security groups, key-pair references, and public IPv4 resources.
- Check the current AWS prices and your lab credits. The bastion and both workloads, their EBS volumes, and public IPv4 usage can incur charges.
- Install Terraform and configure AWS credentials for the intended account. Verify the account and Region before applying.
- Create an EC2 key pair named `ewb-lab` in the selected Region and keep its private key on your laptop. Terraform only references the key pair; it does not handle or upload private-key material.
- Find your current public IPv4 address and pass it as a `/32` CIDR. SSH to the bastion is restricted to this address.

Do not commit `.pem` files, credentials, `terraform.tfvars`, or Terraform state. State can contain infrastructure details and belongs in a secure local location or a properly protected remote backend.

## Deploy in checkpoints

See [docs/runbook.md](docs/runbook.md) for the full build, validation, evidence, and cleanup procedure. In brief:

See the [architecture diagram](docs/architecture.md) for the network layout.

```sh
terraform init
terraform fmt -check
terraform validate
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your current public IPv4 /32 and student name.
terraform plan -out=lab.tfplan
# Review the account, Region, resources, and costs before applying.
terraform apply lab.tfplan
```

Use `terraform output` to retrieve instance addresses and connection details. With `enable_peering = false`, the first apply creates the network and instances without a peer connection or peer routes, allowing the required baseline failure. After capturing it, set `enable_peering = true` and apply again to add the peering connection and both private return routes. Add the bastion public address to the provided [SSH config example](docs/ssh-config.example).

## Resource map

| Resource | CIDR / address | Purpose |
| --- | --- | --- |
| `ewb-vpc-a` | `10.10.0.0/16` | Bastion and App-A |
| `ewb-a-public` | `10.10.1.0/24` | Public bastion subnet |
| `ewb-a-private` | `10.10.2.0/24` | Private App-A subnet |
| `ewb-vpc-b` | `10.20.0.0/16` | App-B workload |
| `ewb-b-private` | `10.20.1.0/24` | Private App-B subnet |
| Bastion | `10.10.1.10` | Public administration entry point |
| App-A | `10.10.2.10` | Private workload in VPC A |
| App-B | `10.20.1.10` | Private workload in VPC B |

## Safety and scope

Terraform provisions AWS resources when you run `terraform apply`; it is not run automatically by this repository. No NAT gateway is created. Private instances have no public IPv4 address and no internet egress route. The project-specific security groups allow SSH only from the bastion or your supplied `/32`, and ICMP Echo requests only from the peer workload. Default outbound rules are retained for this beginner lab. Clean up with `terraform destroy` after saving your evidence.

