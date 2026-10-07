#!/bin/bash
set -e

echo "=== 1. Checking / Setting up Java 21 ==="
if ! command -v java >/dev/null 2>&1 || ! java -version 2>&1 | grep -q "21\."; then
  echo "Installing OpenJDK 21..."
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends openjdk-21-jdk-headless unzip curl
fi

export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
echo "Java Version:"
java -version

echo "=== 2. Checking / Setting up Android SDK ==="
SDK_DIR="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-/tmp/android-sdk}}"
mkdir -p "$SDK_DIR"

if [ ! -f "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "Downloading Android command-line tools..."
  mkdir -p "$SDK_DIR/cmdline-tools"
  curl -sS -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q -o /tmp/cmdline-tools.zip -d "$SDK_DIR/cmdline-tools"
  rm -rf "$SDK_DIR/cmdline-tools/latest"
  mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"
  rm -f /tmp/cmdline-tools.zip
fi

export ANDROID_HOME="$SDK_DIR"
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/36.0.0:$PATH

echo "Accepting Android SDK licenses..."
yes | "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1 || true

if [ ! -d "$SDK_DIR/platforms/android-36" ] || [ ! -d "$SDK_DIR/build-tools/36.0.0" ]; then
  echo "Installing Android SDK Platform 36 and Build-Tools 36.0.0..."
  "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" "platform-tools" "platforms;android-36" "build-tools;36.0.0"
fi

echo "=== 3. Setting up Keystore ==="
mkdir -p /root/.android
if [ ! -f /root/.android/debug.keystore ]; then
  echo "Generating debug keystore..."
  keytool -genkey -v -keystore /root/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
fi

echo "=== 4. Setting up local.properties ==="
echo "sdk.dir=$SDK_DIR" > /app/applet/android/local.properties
chmod +x /app/applet/android/gradlew

echo "=== 5. Building Web Assets & Syncing with Capacitor ==="
npm run build
npx cap copy android

echo "=== 6. Running Gradle assembleRelease ==="
cd /app/applet/android
./gradlew assembleRelease --no-daemon --stacktrace

OUTPUT_APK="/app/applet/android/app/build/outputs/apk/release/RecoveryTribe.apk"

if [ ! -f "$OUTPUT_APK" ]; then
  echo "ERROR: Release APK not generated at $OUTPUT_APK"
  exit 1
fi

echo "=== 7. Verifying APK Package Structure & Signature ==="
cd /app/applet

# Verify signature
"$SDK_DIR/build-tools/36.0.0/apksigner" verify --verbose "$OUTPUT_APK"

# Verify badging (package name, version, minSdk, targetSdk)
"$SDK_DIR/build-tools/36.0.0/aapt2" dump badging "$OUTPUT_APK" | head -n 20

# Check file size
FILE_SIZE=$(ls -lh "$OUTPUT_APK" | awk '{print $5}')
BYTES_SIZE=$(stat -c%s "$OUTPUT_APK" 2>/dev/null || stat -f%z "$OUTPUT_APK")

echo "APK Size: $FILE_SIZE ($BYTES_SIZE bytes)"

# Copy to release distribution paths
mkdir -p /app/applet/dist-apk /app/applet/public
cp -f "$OUTPUT_APK" /app/applet/RecoveryTribe.apk
cp -f "$OUTPUT_APK" /app/applet/dist-apk/RecoveryTribe.apk
cp -f "$OUTPUT_APK" /app/applet/public/RecoveryTribe.apk

echo "=== Build Complete Successfully ==="
ls -lh /app/applet/RecoveryTribe.apk
