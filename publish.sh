#!/bin/bash

# Netlify API Framework - NPM Publish Script
# This script automates the process of publishing the package to NPM

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
print_status "Checking required tools..."

if ! command_exists npm; then
    print_error "npm is not installed. Please install Node.js and npm."
    exit 1
fi

if ! command_exists git; then
    print_error "git is not installed. Please install git."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Ask for version bump type
echo ""
echo "Select version bump type:"
echo "1) patch (1.0.0 -> 1.0.1)"
echo "2) minor (1.0.0 -> 1.1.0)"
echo "3) major (1.0.0 -> 2.0.0)"
echo "4) custom version"
echo "5) skip version bump"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version: " CUSTOM_VERSION
        VERSION_TYPE="$CUSTOM_VERSION"
        ;;
    5)
        VERSION_TYPE=""
        print_warning "Skipping version bump"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Check for uncommitted changes
print_status "Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes:"
    git status --short
    read -p "Do you want to continue? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        print_error "Publish cancelled"
        exit 1
    fi
fi

# Check if we're on main/master branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    print_warning "You're not on main/master branch (current: $CURRENT_BRANCH)"
    read -p "Do you want to continue? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        print_error "Publish cancelled"
        exit 1
    fi
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf coverage/
rm -rf node_modules/.cache/

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Run tests
print_status "Running tests..."
npm run test:run
if [ $? -ne 0 ]; then
    print_error "Tests failed. Aborting publish."
    exit 1
fi

print_success "All tests passed!"

# Run tests with coverage
print_status "Running tests with coverage..."
npm run test:coverage
if [ $? -ne 0 ]; then
    print_error "Coverage tests failed. Aborting publish."
    exit 1
fi

# Build the project
print_status "Building project..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed. Aborting publish."
    exit 1
fi

print_success "Build completed successfully!"

# Check if dist directory exists and has files
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    print_error "dist directory is empty or doesn't exist. Build may have failed."
    exit 1
fi

# Bump version if requested
if [ -n "$VERSION_TYPE" ] && [ "$VERSION_TYPE" != "" ]; then
    print_status "Bumping version ($VERSION_TYPE)..."
    
    if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+.*$ ]]; then
        # Custom version
        npm version "$VERSION_TYPE" --no-git-tag-version
    else
        # Standard bump
        npm version "$VERSION_TYPE" --no-git-tag-version
    fi
    
    NEW_VERSION=$(node -p "require('./package.json').version")
    print_success "Version bumped to: $NEW_VERSION"
fi

# Get final version for tagging
FINAL_VERSION=$(node -p "require('./package.json').version")

# Dry run to check what will be published
print_status "Running npm publish dry-run..."
npm publish --dry-run
if [ $? -ne 0 ]; then
    print_error "Dry run failed. Please check the output above."
    exit 1
fi

print_success "Dry run successful!"

# Show what will be published
echo ""
print_status "Files that will be published:"
npm pack --dry-run 2>/dev/null | grep -E "^npm notice"

# Final confirmation
echo ""
print_warning "Ready to publish version $FINAL_VERSION to NPM"
read -p "Do you want to proceed with publishing? (y/N): " final_confirm

if [[ $final_confirm != [yY] ]]; then
    print_error "Publish cancelled by user"
    exit 1
fi

# Check if user is logged in to npm
print_status "Checking NPM authentication..."
npm whoami >/dev/null 2>&1
if [ $? -ne 0 ]; then
    print_error "You are not logged in to NPM. Please run 'npm login' first."
    exit 1
fi

NPM_USER=$(npm whoami)
print_success "Logged in as: $NPM_USER"

# Publish to NPM
print_status "Publishing to NPM..."
npm publish
if [ $? -ne 0 ]; then
    print_error "NPM publish failed!"
    exit 1
fi

print_success "Successfully published to NPM!"

# Commit version changes if version was bumped
if [ -n "$VERSION_TYPE" ] && [ "$VERSION_TYPE" != "" ]; then
    print_status "Committing version bump..."
    git add package.json package-lock.json
    git commit -m "chore: bump version to $FINAL_VERSION"
    
    # Create git tag
    print_status "Creating git tag..."
    git tag "v$FINAL_VERSION"
    
    # Ask to push changes
    read -p "Do you want to push changes and tags to remote? (y/N): " push_confirm
    if [[ $push_confirm == [yY] ]]; then
        print_status "Pushing to remote..."
        git push origin "$CURRENT_BRANCH"
        git push origin "v$FINAL_VERSION"
        print_success "Changes and tags pushed to remote!"
    else
        print_warning "Don't forget to push your changes: git push origin $CURRENT_BRANCH && git push origin v$FINAL_VERSION"
    fi
fi

# Final success message
echo ""
print_success "🎉 Package successfully published!"
print_success "📦 Package: netlify-api-framework@$FINAL_VERSION"
print_success "🔗 NPM: https://www.npmjs.com/package/netlify-api-framework"

# Show installation command
echo ""
print_status "Users can now install your package with:"
echo "npm install netlify-api-framework@$FINAL_VERSION"

echo ""
print_success "Publish process completed successfully! 🚀"
