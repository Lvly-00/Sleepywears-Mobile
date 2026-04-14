# ============================================
# CLEAN EXPO ANDROID BUILD SCRIPT
# ============================================

# Go to project folder
$projectRoot = "C:\Users\ly\Documents\Coding\ISPM-AppDev\Sleepywears-Mobile"
Set-Location $projectRoot
Write-Host "📍 Forced project root: $projectRoot"
Write-Host "Starting clean build..."

# Kill processes
taskkill /F /IM java.exe 2>$null
taskkill /F /IM node.exe 2>$null

# Clean project
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Clear npm cache
$npmCache = npm config get cache
if (Test-Path $npmCache) {
    Remove-Item -Recurse -Force $npmCache -ErrorAction SilentlyContinue
}
npm cache verify

# Install dependencies
npm install --legacy-peer-deps

# Set CI mode
$env:CI = "true"

# Expo doctor
npx expo-doctor

# Dotenv test (safe)
node -e "require('dotenv/config'); console.log('dotenv loaded')"
# Prebuild
npx expo prebuild --clean --no-install

# Fix AndroidManifest
$manifestPath = "android/app/src/main/AndroidManifest.xml"

if (Test-Path $manifestPath) {
    $content = Get-Content $manifestPath -Raw

    if ($content -notmatch 'android:usesCleartextTraffic="true"') {
        $content = $content -replace '<application\s+', '<application android:usesCleartextTraffic="true" '
        $content | Set-Content $manifestPath
        Write-Host "Manifest patched"
    } else {
        Write-Host "Manifest already OK"
    }
} else {
    Write-Host "Manifest not found"
}

# Build APK
Set-Location "android"
.\gradlew clean
.\gradlew assembleRelease
Set-Location ".."

# Open output
explorer "android\app\build\outputs\apk\release\"

Write-Host "Build complete!"