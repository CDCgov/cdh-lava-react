FROM ubuntu:23.04

# Define build-time variables
ARG CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET
ARG APPS_CLIENT_SECRET=$CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET
ARG AZURE_CLIENT_SECRET=$CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET
ARG GIT_USER_NAME=jcbowyer
ARG GIT_USER_EMAIL=jcbowyer@hotmail.com
ARG TZ=America/New_York
ARG DEBIAN_FRONTEND=noninteractive
ARG GITHUB_TOKEN
ARG USER_ID
ARG GROUP_ID

ENV USER_ID=${USER_ID}
ENV GROUP_ID=${GROUP_ID}


# Set the environment variables based on ARG values
ENV CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET=${CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET} \
    APPS_CLIENT_SECRET=${APPS_CLIENT_SECRET} \
    AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET} \
    TZ=${TZ} \
    DEBIAN_FRONTEND=${DEBIAN_FRONTEND}

# Install required packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash sudo coreutils procps fuse gcc apt-transport-https dnsutils watch dnsperf \
    gnupg-agent libcairo2-dev lsb-release software-properties-common pkg-config make \
    git wget build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev \
    libsqlite3-dev llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev \
    liblzma-dev libsasl2-dev man-db shellcheck ca-certificates curl gnupg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Setup Docker repository
RUN install -m 0755 -d /etc/apt/keyrings && \
    apt-get update && apt-get install -y wget gnupg2 lsb-release ca-certificates && \
    wget -qO- https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null && \
    apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER root

RUN echo USER_ID=${USER_ID}, GROUP_ID=${GROUP_ID}

# Creating a developer user
RUN useradd -m -u ${USER_ID} -g ${GROUP_ID}  -s /bin/bash developer && \
    echo 'developer ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/developer && \
    chmod 0440 /etc/sudoers.d/developer

# Install NVM, Node.js, and npm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    export NVM_DIR="$HOME/.nvm" && \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
    nvm install 20 && nvm use 20 && node --version && npm --version

# Copying necessary files
# Ensure the ownership and permissions are correct
COPY --chown=developer:developer .devcontainer/script_node_app_entrypoint.sh /home/developer/node_app/entrypoint.sh
COPY --chown=developer:developer . /home/developer/projects/cdh_lava_react_app

RUN chmod +x /home/developer/node_app/entrypoint.sh

# Switch to the developer user
USER developer

WORKDIR /home/developer/projects/cdh_lava_react_app

# Create the .npmrc file using the build argument
RUN echo "@cdcent:registry=https://npm.pkg.github.com/" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc && \
    echo "always-auth=true" >> .npmrc

# Set the working directory to the project directory
WORKDIR /home/developer/projects/cdh_lava_react_app/cdc_react

# Install project dependencies
RUN if [ -f package.json ]; then npm install; else echo "package.json not found"; exit 1; fi

# Use ENTRYPOINT to specify the startup command
ENTRYPOINT [".devcontainer/script_node_app_entrypoint.sh"]
