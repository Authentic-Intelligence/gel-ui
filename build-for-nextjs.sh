#!/bin/bash
# Build Gel UI and copy to the Next.js app

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXTJS_PUBLIC_DIR="${SCRIPT_DIR}/../makenewfriends-app/public/gel-ui-dist"

echo "Building Gel UI..."
cd "${SCRIPT_DIR}/web"
yarn build

echo "Copying build to Next.js public directory..."
rm -rf "${NEXTJS_PUBLIC_DIR}"
cp -r build "${NEXTJS_PUBLIC_DIR}"

echo "Done! Gel UI has been built and copied to ${NEXTJS_PUBLIC_DIR}"

