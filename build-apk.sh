#!/bin/bash

# Build APK Script for Chaveiro Já

echo "🔨 Building APK for Chaveiro Já..."
echo ""

cd app

# 1. Check if Capacitor is installed
if ! npm list @capacitor/core > /dev/null 2>&1; then
    echo "📦 Installing Capacitor..."
    npm install @capacitor/core @capacitor/cli
fi

# 2. Add Android if not exists
if [ ! -d "android" ]; then
    echo "📱 Adding Android platform..."
    npx cap add android
fi

# 3. Build the web assets
echo "🔨 Building web assets..."
npm run build

# 4. Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# 5. Build APK
echo "📦 Building APK..."
npx cap build android

# 6. Output location
echo ""
echo "✅ APK BUILD COMPLETE!"
echo ""
echo "📍 APK Location:"
echo "   android/app/release/app-release.apk"
echo ""
echo "🚀 To install on device:"
echo "   adb install -r android/app/release/app-release.apk"
echo ""
echo "📱 To publish on Google Play Store:"
echo "   1. Go to play.google.com/console"
echo "   2. Create new app ($25 one-time fee)"
echo "   3. Upload APK"
echo "   4. Wait for review (24-48 hours)"
echo ""
