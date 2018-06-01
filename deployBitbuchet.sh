#!/bin/bash
rm -rf library
cp -R TestVideo/library library
npm publish --access
