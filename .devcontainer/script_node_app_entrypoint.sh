#!/bin/bash
# Starting Docker daemon
service docker start
# Navigate to a specific package, if needed
cd /cdc_react
# Start the development server. Adjust this command according to your setup.
npm start
