# Build, test, submit, and clean up

This runbook follows the attached EWB workbook. AWS resources are created only when you run the commands below. Terraform uses `ap-south-1` by default; verify the account and Region before every apply.

## 1. Prepare your account and workstation

1. Install Terraform and AWS CLI. Configure credentials for your lab account, then run `aws sts get-caller-identity` and `aws configure get region` to confirm the identity and default CLI Region. Terraform uses `aws_region` from `terraform.tfvars`.
2. In the EC2 console in the same Region, create the RSA key pair `ewb-lab`. Download the private key to your computer. Do not add it to this repository or copy it to any instance.
3. Find your current public IPv4 address. Put it in `terraform.tfvars` as one `/32` address. If your address changes, update the variable and apply again before trying to SSH.
4. Copy `terraform.tfvars.example` to `terraform.tfvars`, enter your name and actual public IPv4 `/32`, and keep `enable_peering = false` for the first deployment.

Protect `terraform.tfvars` and the Terraform state file. `.gitignore` excludes them. Do not use example IPs as real values.

## 2. Review and create the baseline environment

From the repository root:

```sh
terraform init
terraform fmt -check
terraform validate
terraform plan -out=baseline.tfplan
terraform show baseline.tfplan
```

Review the selected account, Region, three EC2 instances, public IPv4, EBS volumes, security group rules, and expected charges. The plan must show no peering connection when `enable_peering` is false. When ready, create the resources:

```sh
terraform apply baseline.tfplan
terraform output
```

Wait for all instances to pass EC2 status checks. Confirm App-A and App-B have no public IPv4 address. Record IDs and addresses from `terraform output` in your report inventory.

The public route table has the internet gateway route. The private tables initially contain only their local VPC routes. No NAT gateway or internet route is created for either private subnet.

## 3. Configure laptop SSH and capture the pre-peering baseline

Copy `docs/ssh-config.example` into `~/.ssh/config`, replace `BASTION_PUBLIC_IP` with the bastion address from Terraform output, and ensure the key path points to your locally stored key. On Linux, macOS, or WSL:

```sh
chmod 400 ~/.ssh/ewb-lab.pem
ssh ewb-bastion
```

Verify the host identity before accepting its SSH host key. Exit to your laptop, then connect to App-A:

```sh
ssh ewb-app-a
hostname
hostname -I
ping -c 4 10.20.1.10
```

The ping should receive no replies because there is no peering connection or route. Capture the terminal output as the baseline. This is an expected lab result, not proof that the final network works.

## 4. Enable peering and validate private connectivity

Set `enable_peering = true` in `terraform.tfvars`, then review and apply the change:

```sh
terraform plan -out=peering.tfplan
terraform show peering.tfplan
terraform apply peering.tfplan
terraform output
```

Terraform creates and auto-accepts the same-account, same-Region peering connection. It adds `10.20.0.0/16` to both VPC A route tables and `10.10.0.0/16` to the VPC B private route table. The public subnet needs its peering route so the bastion can open the second SSH leg to App-B. Replies need the VPC B return route.

Run the required checks from the laptop:

```sh
ssh ewb-app-a
hostname
hostname -I
ping -c 4 10.20.1.10
exit
ssh ewb-app-b
hostname
hostname -I
ping -c 4 10.10.2.10
```

Both ping commands should show four replies with 0% packet loss. `ssh ewb-app-b` must reach App-B through ProxyJump. Save terminal evidence showing host identity, command, and result. In the EC2 console, save evidence that both app instances have no public IPv4 address.

## 5. Demonstrate a controlled failure and recovery

1. In the EC2 console, open `ewb-sg-app-b` inbound rules and temporarily remove only the ICMP Echo request rule whose source is `10.10.2.10/32`. Keep TCP 22 from `10.10.1.10/32`.
2. From App-A, rerun `ping -c 4 10.20.1.10`. It should fail. Capture the output and the changed rule.
3. Restore the exact ICMP rule. You can restore it in the console or run `terraform apply` and review the plan; Terraform will restore the declared rule.
4. Rerun the ping and capture the successful recovery.

The failed ping demonstrates that an active peering connection and working routes are not sufficient by themselves. The destination security group must allow the inbound Echo request. Security groups are stateful, so the allowed reply traffic does not need a separate inbound rule.

## 6. Complete the report

Use [report-template.md](report-template.md) to prepare `YourName_EWB_VPC_Peering.pdf`. Replace every placeholder with your own values and results. Include your architecture, actual AWS resource IDs, subnet associations and route tables, security rules, active peering, baseline, both successful pings, ProxyJump proof, controlled failure and recovery, cleanup evidence, and a short explanation of forward and return paths. Do not claim expected results as observed results. Do not include credentials or the private key.

## 7. Clean up

Save the report and screenshots before deleting resources. Destroy only after confirming the current Terraform workspace/state belongs to this lab:

```sh
terraform plan -destroy
terraform destroy
```

Confirm the three lab instances and their EBS volumes are gone. Terraform creates no Elastic IP, but verify the account for leftover project public IPv4 allocations, volumes, or snapshots. Delete the EC2 key pair `ewb-lab` from the console if it is no longer needed, and remove the local private key securely if appropriate. Confirm the VPCs, subnets, route tables, peering connection, and project security groups are gone. Check billing for remaining usage; reporting may be delayed.

## Troubleshooting order

- Bastion timeout: check its current public IPv4, your current `/32` ingress source, public subnet association, and internet gateway default route.
- App-A SSH failure: check key, `ec2-user`, bastion address, App-A private IP, and TCP 22 source `10.10.1.10/32`.
- App-B SSH failure: check ProxyJump, both VPC route directions, active peering, and App-B TCP 22 source `10.10.1.10/32`.
- Ping failure after peering: check exact destination IP, active peering, route tables for both subnets, and the destination Echo request rule.
- `Permission denied (publickey)`: check the key pair and local key path. Reaching SSH authentication means the network path is working.
- Package downloads on private hosts: these subnets have no internet egress. Package updates are outside the project and their failure does not indicate broken peering.

