FROM ubuntu:23.04

# Define build-time variables
ARG CDH_LAVA_CORE_DEV_AZ_CLIENT_SECRET
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

# Minimize the image and install basic packages
RUN apt-get update && yes | unminimize && apt-get install -y \
    git wget curl sudo build-essential libssl-dev zlib1g-dev libbz2-dev \
    libreadline-dev libsqlite3-dev llvm libncurses5-dev libncursesw5-dev \
    xz-utils tk-dev libffi-dev liblzma-dev libsasl2-dev ca-certificates gnupg \
    scala man-db shellcheck \
    && rm -rf /var/lib/apt/lists/* && apt-get clean

# Install Node.js (Latest LTS version recommended) and Yarn
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && npm install --global yarn

# Creating a developer user
RUN useradd -m -s /bin/bash developer \
    && echo 'developer ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/developer \
    && chmod 0440 /etc/sudoers.d/developer

# Switch to the developer user
USER developer

# Set the working directory to the project directory
WORKDIR /home/developer/projects/cdh-lava-react/cdc_react

# Assuming the React project files are in the same directory as the Dockerfile, or adjust the source path as necessary.
COPY --chown=developer:developer . .

# Install project dependencies
RUN if [ -f package.json ]; then npm install; else echo "package.json not found"; exit 1; fi

# Note: The Dockerfile should not include secrets directly for security reasons.
# Pass secrets at runtime using environment variables or Docker secrets.
