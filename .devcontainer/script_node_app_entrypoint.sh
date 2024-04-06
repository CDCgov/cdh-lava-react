#!/bin/bash
# Starting Docker daemon

# Get current USER_ID and GROUP_ID
USER_ID=$(id -u)
GROUP_ID=$(id -g)

# File to update
ENV_FILE="../.env" # Adjusted path

# Update or create USER_ID and GROUP_ID in the .env file
if grep -q "USER_ID=" "$ENV_FILE"; then
    sed -i "s/USER_ID=.*/USER_ID=${USER_ID}/" "$ENV_FILE"
else
    echo "USER_ID=${USER_ID}" >> "$ENV_FILE"
fi

if grep -q "GROUP_ID=" "$ENV_FILE"; then
    sed -i "s/GROUP_ID=.*/GROUP_ID=${GROUP_ID}/" "$ENV_FILE"
else
    echo "GROUP_ID=${GROUP_ID}" >> "$ENV_FILE"
fi

service docker start

# Navigate to a specific package, if needed
cd ../cdc_react

# Start the development server. Adjust this command according to your setup.
npm start
