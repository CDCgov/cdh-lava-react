################################################################################
# Docker and System Configuration Makefile
#
# Simplifies Docker setup in WSL Ubuntu and includes system utility commands.
#
# Targets:
# - `ubuntu-print-tree`: Displays the directory structure using the tree command. Installs `tree` if not present.
# Other targets as previously documented...
################################################################################

# Checks if the `tree` command is available and installs it if not, then prints the directory tree to a file
ubuntu-print-tree:
	@which tree > /dev/null || (echo "Installing tree..." && sudo apt-get update && sudo apt-get install -y tree)
	@echo "Printing directory structure to docs/directory_structure.txt..."
	@mkdir -p docs
	@tree > docs/directory_structure.txt

ubuntu-node-entrypoint:
	sudo .devcontainer/script_node_app_entrypoint.sh

