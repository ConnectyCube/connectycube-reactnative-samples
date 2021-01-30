#!/bin/bash

BUILD_VERSION=1.0.0

current_dir=`pwd`
d=`date +%m_%d_%Y_%H_%M_%S`

cd android
rm -rf app/build/outputs/apk/release
./gradlew app:assembleRelease
cd app/build/outputs/apk/release/
# mv app-release.apk RNVideoChat-${BUILD_VERSION}-${d}.apk
mv app-release.apk RNVideoChat.apk
# open .
echo "adb install android/app/build/outputs/apk/release/RNVideoChat.apk"
cd ${current_dir}
