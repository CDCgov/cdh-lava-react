FROM ubuntu:23.04

# Define build-time variables
ARG CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET="ENTER_YOUR_AZURE_CLIENT_SECRET"
ARG APPS_CLIENT_SECRET=$CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET
ARG AZURE_CLIENT_SECRET=$CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET
ARG GIT_USER_NAME=jcbowyer
ARG GIT_USER_EMAIL=jcbowyer@hotmail.com
ARG TZ=America/New_York
ARG DEBIAN_FRONTEND=noninteractive

# Set the environment variables based on ARG values
ENV CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET=${CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET} \
    APPS_CLIENT_SECRET=${APPS_CLIENT_SECRET} \
    AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET} \
    TZ=${TZ} \
    DEBIAN_FRONTEND=${DEBIAN_FRONTEND}

# Minimize the image
RUN apt-get update && yes | unminimize

# Update and install basic packages
RUN apt-get update && apt-get install -y \
    git wget curl sudo build-essential libssl-dev zlib1g-dev libbz2-dev \
    libreadline-dev libsqlite3-dev llvm libncurses5-dev libncursesw5-dev \
    xz-utils tk-dev libffi-dev liblzma-dev libsasl2-dev ca-certificates gnupg \
    scala man-db shellcheck \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Node.js (Updated to a more recent version, ensuring compatibility with most React projects)
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    # Explicitly install npm in case it's not included
    && apt-get install -y npm \
    && node --version \
    && npm --version \
    && npm install --global yarn

# Creating a developer user
RUN useradd -m -s /bin/bash developer \
    # No password sudo (consider the security implications in your context)
    && echo 'developer ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/developer \
    && chmod 0440 /etc/sudoers.d/developer

# Switch to the developer user
USER developer

# Set the working directory to the cdh-lava-react directory inside the developer's home
WORKDIR /home/developer/projects/cdh-lava-react

# Copy your React project into the Docker image
# This assumes your Dockerfile is located at the root of your project directory.
# If it's located elsewhere, you'll need to adjust the copy source path.
COPY --chown=developer:developer . /home/developer/projects/cdh-lava-react

# Install project dependencies
RUN npm install

# Your application setup can go here
# This section was modified to correctly close the Dockerfile syntax and remove JSON configuration,
# which should be handled in docker-compose.yml or a similar orchestration tool.

# The Dockerfile does not support JSON syntax directly for configuration.
# Configuration for DNS, volumes, and workspace should be defined in your docker-compose.yml file or through Docker run command flags.
