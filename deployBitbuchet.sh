#!/bin/bash
VERSION='1.0.'$1
git checkout -b "release-"$VERSION
git checkout "release-"$VERSION
git push origin "release-"$VERSION
cp -R TestVideo/library /
rm -rf TestVideo/
rm ./deployBitbuchet.sh
git add .
git commit -m 'Created release-'$VERSION
git push --set-upstream origin "release-"$VERSION
