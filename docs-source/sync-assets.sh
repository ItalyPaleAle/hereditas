#!/bin/sh

set -eu

# "azcopy" command, defaults to searching for it in the PATH
: "${AZCOPYCMD:=$(which azcopy)}"
echo "Using azcopy in $AZCOPYCMD"

# Ensure azcopy is installed
"$AZCOPYCMD" --version

# Check required env vars: $ASSETS, $CONTAINER, $AZURE_STORAGE_ACCOUNT
if [ -z "$ASSETS" ]; then
    echo "\$ASSETS is empty"
    exit 1
fi

if [ -z "$CONTAINER" ]; then
    echo "\$CONTAINER is empty"
    exit 1
fi

if [ -z "$AZURE_STORAGE_ACCOUNT" ]; then
    echo "\$AZURE_STORAGE_ACCOUNT is empty"
    exit 1
fi

echo "Syncing with: https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER}"

# Check that all folders specified in $ASSETS exist
for asset in $ASSETS; do
    # Ensure the asset exists and it's a folder
    if [ ! -d "$asset" ]; then
        echo "$asset doesn't exist or it's not a folder"
        exit 2
    fi
done

# Sync all folders
for asset in $ASSETS; do
    # Sync the folder
    "$AZCOPYCMD" sync "$asset" https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER}/${asset} --recursive --delete-destination=true
done
