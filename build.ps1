$projectRoot = "C:\Users\ly\Documents\Mobile"
Set-Location $projectRoot

Write-Host "Starting clean build..."

taskkill /F /IM java.exe 2>$null
taskkill /F /IM node.exe 2>$null

Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

npm cache verify
npm install --legacy-peer-deps

$env:CI = "true"

npx expo prebuild --clean --no-install

$manifestPath = "android/app/src/main/AndroidManifest.xml"

if (Test-Path $manifestPath) {
    $content = Get-Content $manifestPath -Raw
    if ($content -notmatch 'usesCleartextTraffic') {
        $content = $content -replace '<application\s+', '<application android:usesCleartextTraffic="true" '
        $content | Set-Content $manifestPath
    }
}

Set-Location android
.\gradlew clean
.\gradlew assembleRelease
Set-Location ..

explorer "android\app\build\outputs\apk\release"

Write-Host "Build complete!"