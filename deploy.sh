#!/bin/bash

# Deployment Script - Interactive

echo "🚀 Chaveiro Já - Deploy Script"
echo "================================"
echo ""
echo "Escolha uma opção de deploy:"
echo ""
echo "1) Base44 Cloud (Recomendado)"
echo "2) Railway"
echo "3) Vercel"
echo "4) Docker + Cloud"
echo "5) Build Local (teste)"
echo ""
read -p "Escolha (1-5): " OPTION

case $OPTION in
  1)
    echo ""
    echo "🚀 Deploying to Base44..."
    cd app
    base44 deploy
    ;;
  2)
    echo ""
    echo "🚀 Deploying to Railway..."
    cd app
    railway up
    ;;
  3)
    echo ""
    echo "🚀 Deploying to Vercel..."
    cd app
    vercel
    ;;
  4)
    echo ""
    echo "🐳 Building Docker image..."
    bash build-docker.sh
    echo ""
    echo "📤 Push to Docker Hub:"
    echo "   docker tag chaveiro-ja:latest seu-usuario/chaveiro-ja:latest"
    echo "   docker push seu-usuario/chaveiro-ja:latest"
    ;;
  5)
    echo ""
    echo "🔨 Building locally..."
    cd app
    npm run build
    echo ""
    echo "✅ Build complete! Files in: dist/"
    echo "Preview: npm run preview"
    ;;
  *)
    echo "❌ Invalid option"
    exit 1
    ;;
esac

echo ""
echo "✅ Deploy process completed!"
