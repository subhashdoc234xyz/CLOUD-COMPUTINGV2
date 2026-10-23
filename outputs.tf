output "aws_region" {
  description = "Region containing the lab resources."
  value       = var.aws_region
}

output "vpc_ids" {
  description = "VPC IDs for the project inventory."
  value = {
    vpc_a = aws_vpc.a.id
    vpc_b = aws_vpc.b.id
  }
}

output "subnet_ids" {
  description = "Subnet IDs and CIDR plan."
  value = {
    a_public  = aws_subnet.a_public.id
    a_private = aws_subnet.a_private.id
    b_private = aws_subnet.b_private.id
  }
}

output "instance_inventory" {
  description = "Instance IDs and private IPv4 addresses; only the bastion has a public address."
  value = {
    bastion = {
      id         = aws_instance.bastion.id
      private_ip = aws_instance.bastion.private_ip
      public_ip  = aws_instance.bastion.public_ip
    }
    app_a = {
      id         = aws_instance.app_a.id
      private_ip = aws_instance.app_a.private_ip
      public_ip  = aws_instance.app_a.public_ip
    }
    app_b = {
      id         = aws_instance.app_b.id
      private_ip = aws_instance.app_b.private_ip
      public_ip  = aws_instance.app_b.public_ip
    }
  }
}

output "peering_connection_id" {
  description = "Active VPC peering connection ID, or null during the pre-peering baseline phase."
  value       = var.enable_peering ? aws_vpc_peering_connection.a_b[0].id : null
}

output "route_table_ids" {
  description = "Explicitly associated project route table IDs."
  value = {
    a_public  = aws_route_table.a_public.id
    a_private = aws_route_table.a_private.id
    b_private = aws_route_table.b_private.id
  }
}

