#!/bin/bash

# Build Docker Image Script

echo "🐳 Building Docker Image for Chaveiro Já..."
echo ""

# Get version from package.json
VERSION=$(grep '"version"' app/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | xargs)

echo "📦 Building image: chaveiro-ja:$VERSION"
echo ""

# Build the image
docker build -t chaveiro-ja:$VERSION -t chaveiro-ja:latest .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ IMAGE BUILD COMPLETE!"
    echo ""
    echo "📊 Image Info:"
    docker images | grep chaveiro-ja
    echo ""
    echo "🚀 To run locally:"
    echo "   docker run -p 3000:3000 chaveiro-ja:latest"
    echo ""
    echo "📤 To push to Docker Hub:"
    echo "   docker tag chaveiro-ja:latest seu-usuario/chaveiro-ja:latest"
    echo "   docker push seu-usuario/chaveiro-ja:latest"
    echo ""
else
    echo "❌ Build failed!"
    exit 1
fi
