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
    scala man-db shellcheck xz-utils tk-dev \
    libffi-dev liblzma-dev libsasl2-dev ca-certificates gnupg \
    # Install Node.js and Yarn
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && npm install --global yarn \
    # Cleanup to keep the image clean
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Creating a developer user
RUN useradd -m -s /bin/bash developer \
    # No password sudo (consider the security implications in your context)
    && echo 'developer ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/developer \
    && chmod 0440 /etc/sudoers.d/developer

# Switch to the developer user
USER developer

# Set the working directory to the developer's home directory
WORKDIR /home/developer

# Your application setup can go here
