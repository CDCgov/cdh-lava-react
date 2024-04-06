################################################################################
# Docker Configuration Makefile
#
# This Makefile simplifies the setup and configuration of Docker in a WSL (Windows Subsystem for Linux)
# environment. It commands for system preparation, Docker installation, and post-installation verification.
#
# Targets:
# - `check-wsl`: Verifies and sets WSL to version 2 for Docker compatibility.
# - `docker-full-install`: Executes commands for a complete Docker installation and setup.
# - `docker-remove-old`: Removes prior Docker installations to prevent setup conflicts.
# - `docker-install-dependencies`: Installs required packages for Docker.
# - `docker-add-gpg-key`: Adds Docker's GPG key to ensure package integrity.
# - `docker-add-repo`: Adds Docker's stable repository for package access.
# - `docker-install`: Installs Docker Engine and Docker Compose.
# - `docker-verify`: Confirms Docker's successful installation by running a test container.
#
# Usage:
# Execute `make <target>` to run a specific configuration step. For a full installation, use
# `make` or `make full_install` to perform all setup steps.
################################################################################

# Default target executed when no arguments are given to make.
default: 
	@echo "Docker Full Install ..."
	$(MAKE) docker-full-install

check-wsl:
	@echo "Checking WSL version..."
	wsl --set-default-version 2

docker-remove-old:
	@echo "Removing any old Docker versions..."
	sudo apt remove -y docker docker-engine docker.io containerd runc

docker-install-dependencies:
	@echo "Updating and installing required packages..."
	sudo apt-get update
	sudo apt-get install -y \
	ca-certificates \
	curl \
	gnupg \
	lsb-release

docker-add-gpg-key:
	@echo "Adding Docker's official GPG key..."
	sudo mkdir -p /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

docker-add-repo:
	@echo "Adding Docker's stable repository..."
	echo "deb [arch=$$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

docker-build:
	@echo "Building Docker..."
	@docker build -f .devcontainer/Dockerfile -t test-build .

docker-install:
	@echo "Installing Docker Engine and Docker Compose..."
	sudo apt-get update
	sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

docker-start:
	@echo "Ensuring Docker service is running..."
	sudo service docker start
	@echo "Docker is running."

devcontainer: docker-start
	@echo "Launching Dev Container..."
	# Insert the command to launch your dev container here, for example:
	# code --folder-uri vscode-remote://dev-container+$(shell wslpath -m .)

docker-verify:
	@echo "Verifying Docker installation..."
	sudo docker run hello-world

docker-full-install: check-wsl docker-remove-old docker-install-dependencies docker-add-gpg-key docker-add-repo docker-install docker-verify
	@echo "Full installation completed successfully."
