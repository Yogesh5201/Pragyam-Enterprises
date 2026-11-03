@echo off
echo ========================================================
echo   PRAGYAM ENTERPRISES - ANDROID RELEASE BUILD SCRIPT
echo ========================================================
echo.
echo Option 1: Direct APK Build (Testing / Sideloading)
echo Run: npx eas-cli build --platform android --profile preview --local
echo.
echo Option 2: Signed Google Play Store AAB Bundle (.aab)
echo Run: npx eas-cli build --platform android --profile production --local
echo.
echo Option 3: Expo Prebuild for Native Android Studio Build
echo Run: npx expo prebuild --platform android
echo.
