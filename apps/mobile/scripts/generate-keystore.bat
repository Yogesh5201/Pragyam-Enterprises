@echo off
echo ========================================================
echo   PRAGYAM ENTERPRISES - ANDROID RELEASE KEYSTORE GEN
echo ========================================================
echo Generating RSA 2048-bit release keystore for Google Play...
keytool -genkey -v -keystore pragyam-release.keystore -alias pragyam -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Pragyam Enterprises, OU=Commodity Trading, O=Pragyam Enterprises, L=Karnal, ST=Haryana, C=IN" -storepass PragyamReleaseKey2026! -keypass PragyamReleaseKey2026!

echo Keystore successfully generated: %CD%\pragyam-release.keystore
echo Keep this keystore secure and do not commit to public repositories.
