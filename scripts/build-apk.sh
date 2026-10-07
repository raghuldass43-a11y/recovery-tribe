#!/usr/bin/env bash
set -e

echo "=================================================="
echo "  Building Recovery Tribe Android APK"
echo "=================================================="

# 1. Build production web assets
npm run build

# 2. Sync with Android Capacitor project
npx cap sync android

# 3. Run APK builder
node scripts/build-apk.mjs

echo ""
echo "RecoveryTribe.apk is ready in:"
echo " - ./RecoveryTribe.apk"
echo " - ./dist-apk/RecoveryTribe.apk"
echo " - ./android/app/build/outputs/apk/release/RecoveryTribe.apk"
