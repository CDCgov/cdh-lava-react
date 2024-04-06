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

# Install Node.js (Consider using a more current version for compatibility with latest React projects)
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get install -y npm \
    && node --version \
    && npm --version \
    && npm install --global yarn

# Creating a developer user
RUN useradd -m -s /bin/bash developer \
    && echo 'developer ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/developer \
    && chmod 0440 /etc/sudoers.d/developer

# Switch to the developer user
USER developer

# Set the working directory to a general projects directory
WORKDIR /home/developer/projects

# Create the cdh-lava-react project directory
RUN mkdir cdh-lava-react

# Set the working directory to the cdh-lava-react directory
WORKDIR /home/developer/projects/cdh-lava-react


RUN mkdir cdc_react

# Set the working directory to the cdh-lava-react directory
WORKDIR /home/developer/projects/cdh-lava-react/cdc_react
RUN ls -la

# Check for package.json
RUN ls -la && test -f package.json || (echo "package.json not found" && false)

# Copy your React project into the Docker image
# Adjust the source path as necessary to match the location of your React project relative to the Dockerfile
COPY --chown=developer:developer . /home/developer/projects/cdh-lava-react/cdc_react

# Install project dependencies
RUN npm install

# Note: Additional JSON-like configuration that appeared at the end of your original request 
# should be placed in a docker-compose.yml file or applied as command-line options when running the container.
