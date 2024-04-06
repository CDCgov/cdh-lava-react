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


# Set the environment variables based on ARG values
ENV CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET=${CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET} \
    APPS_CLIENT_SECRET=${APPS_CLIENT_SECRET} \
    AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET} \
    TZ=${TZ} \
    DEBIAN_FRONTEND=${DEBIAN_FRONTEND}

## Install port lsof
RUN apt-get update && apt-get install lsof -y --no-install-recommends

# Install required packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    sudo \
    coreutils \
    procps \
    fuse \
    gcc \
    apt-transport-https \
    dnsutils \
    watch \
    dnsperf \
    gnupg-agent \
    libcairo2-dev \
    lsb-release \
    software-properties-common \
    pkg-config \
    make

# Minimize the image and install basic packages
# Minimize the image and install basic packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git wget  build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev llvm \
    libncurses5-dev libncursesw5-dev xz-utils tk-dev \
    libffi-dev liblzma-dev libsasl2-dev \
    man-db shellcheck  && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Update CA certificates
RUN apt-get update && sudo apt-get install -y ca-certificates && sudo update-ca-certificates

# Install Node.js (Latest LTS version recommended) and Yarn
# Install required dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs npm

# Display Node.js and npm versions
RUN node --version && npm --version
 
RUN node -v && npm -v

# Setup Docker repository
RUN install -m 0755 -d /etc/apt/keyrings

# Update packages and install dependencies required for adding the Docker repository
RUN apt-get update && apt-get install -y wget gnupg2 lsb-release ca-certificates

# Setup Docker repository and add Docker's official GPG key
RUN wget -qO- https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN chmod a+r /etc/apt/keyrings/docker.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null

# Install Docker and related packages
RUN apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
RUN apt-get clean \  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Remove temporary and unnecessary files to minimize image size
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER root
 

# Creating a developer user
RUN useradd -m -u ${USER_ID} -g ${GROUP_ID}  -s /bin/bash developer \
    && echo 'developer ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/developer \
    && chmod 0440 /etc/sudoers.d/developer

# Debug: Before copying, list files in the current directory to see what will be copied
RUN ls -la

RUN mkdir -p /home/developer/projects/cdh_lava_react_app/ /home/developer/node_app

COPY --chown=developer:developer .devcontainer/script_node_app_entrypoint.sh /home/developer/node_app/entrypoint.sh
# Debug: After copying, check if the file exists in the target directory

COPY --chown=developer:developer . /home/developer/projects/cdh_lava_react_app
# Debug: After copying, list contents of the project directory

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
RUN if [ "$(ls -A )" ]; then \
        ls -la; \
    else \
        echo "No files found in the directory"; \
    fi

RUN if [ -f package.json ]; then npm install; else echo "package.json not found"; exit 1; fi

# Note: The Dockerfile should not include secrets directly for security reasons.
# Pass secrets at runtime using environment variables or Docker secrets.
# Use ENTRYPOINT to specify the startup command
ENTRYPOINT ["../.devcontainer/script_node_app_entrypoint.sh"]