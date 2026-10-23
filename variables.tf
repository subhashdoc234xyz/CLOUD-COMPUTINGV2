variable "aws_region" {
  description = "Single AWS Region for the lab (the workbook example is Mumbai)."
  type        = string
  default     = "ap-south-1"
}

variable "student_name" {
  description = "Student tag applied to all taggable resources."
  type        = string
  default     = "Student"
}

variable "my_public_ip_cidr" {
  description = "Your current public IPv4 CIDR, restricted to one address (for example 203.0.113.10/32)."
  type        = string

  validation {
    condition     = can(cidrnetmask(var.my_public_ip_cidr)) && can(regex("/32$", var.my_public_ip_cidr))
    error_message = "my_public_ip_cidr must be one IPv4 address with a /32 mask."
  }
}

variable "key_pair_name" {
  description = "Existing EC2 key pair name in the selected Region. The private key is never managed by Terraform."
  type        = string
  default     = "ewb-lab"
}

variable "enable_peering" {
  description = "Set true only after capturing the baseline failure; creates the peering connection and all three peering routes."
  type        = bool
  default     = false
}

variable "instance_type" {
  description = "Instructor-approved small x86 instance type; confirm the price in your account before apply."
  type        = string
  default     = "t3.micro"
}

