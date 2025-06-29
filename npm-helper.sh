#!/bin/bash

# NPM Publishing Helper
echo "🚀 Netlify API Framework - Publishing Helper"
echo ""
echo "Available publishing options:"
echo ""
echo "1. 📦 npm run publish:dry     - Test what will be published"
echo "2. 🔧 ./publish.sh            - Interactive publish with version selection"
echo "3. ⚡ ./quick-publish.sh      - Quick patch version publish"
echo "4. 📈 npm run version:patch   - Bump patch version only"
echo "5. 📈 npm run version:minor   - Bump minor version only" 
echo "6. 📈 npm run version:major   - Bump major version only"
echo ""
echo "Current version: $(node -p "require('./package.json').version")"
echo "Package size: $(npm pack --dry-run 2>/dev/null | grep 'package size' | cut -d' ' -f4-)"
echo ""

if [ "$1" = "dry" ]; then
    echo "Running dry-run..."
    npm run publish:dry
elif [ "$1" = "quick" ]; then
    echo "Running quick publish..."
    ./quick-publish.sh
elif [ "$1" = "full" ]; then
    echo "Running full interactive publish..."
    ./publish.sh
else
    echo "Usage: $0 [dry|quick|full]"
    echo "  dry   - Run dry-run to see what would be published"
    echo "  quick - Quick patch version publish"
    echo "  full  - Full interactive publish"
fi
