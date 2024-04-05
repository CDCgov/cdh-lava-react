# Docker Configuration Makefile

# Default target executed when no arguments are given to make.
default: full_install

check_wsl:
	@echo "Checking WSL version..."
	wsl --set-default-version 2

remove_old_docker:
	@echo "Removing any old Docker versions..."
	sudo apt remove -y docker docker-engine docker.io containerd runc

install_dependencies:
	@echo "Updating and installing required packages..."
	sudo apt-get update
	sudo apt-get install -y ca-certificates curl gnupg lsb-release

add_gpg_key:
	@echo "Adding Docker's official GPG key..."
	sudo mkdir -p /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

add_docker_repo:
	@echo "Adding Docker's stable repository..."
	echo "deb [arch=$$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

install_docker:
	@echo "Installing Docker Engine and Docker Compose..."
	sudo apt-get update
	sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

docker-start:
	@echo "Checking if Docker is running..."
	@docker info > /dev/null 2>&1 || (echo "Starting Docker Desktop..." && start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe")
	@echo "Waiting for Docker to start..."
	@timeout /t 10 > NUL

docker-build:
	@echo "Building Docker..."    
	@cd .devcontainer && docker build -f Dockerfile -t test-build .

devcontainer: docker-start
	@echo "Launching Dev Container..."
	# Insert the command to launch your dev container here, for example:
	# code --folder-uri vscode-remote://dev-container+$(shell wslpath -m .)

verify_docker:
	@echo "Verifying Docker installation..."
	sudo docker run hello-world

full_install: check_wsl remove_old_docker install_dependencies add_gpg_key add_docker_repo install_docker docker-start verify_docker
	@echo "Full installation completed successfully."

.PHONY: default check_wsl remove_old_docker install_dependencies add_gpg_key add_docker_repo install_docker verify_docker docker-start docker-build devcontainer full_install
