#!/bin/bash

echo "🔧 Installing Docker and dependencies on EC2..."

# Update system
sudo apt update -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install jq for JSON parsing
sudo apt install -y jq

# Install curl for health checks (usually pre-installed)
sudo apt install -y curl

# Create application directory
sudo mkdir -p /home/ubuntu/hubshift
sudo chown ubuntu:ubuntu /home/ubuntu/hubshift

echo "✅ Docker installation completed!"
echo "📝 Please log out and log back in for Docker group changes to take effect"
echo "🔍 Verify installation with: docker --version && docker-compose --version"
