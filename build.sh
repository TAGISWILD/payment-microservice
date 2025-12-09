#!/bin/bash
set -e

echo "Building React frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "Building Spring Boot application..."
./gradlew clean bootJar

echo "Build complete!"

