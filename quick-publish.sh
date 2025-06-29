#!/bin/bash

# Quick publish script - publishes with patch version bump
# Usage: ./quick-publish.sh

./publish.sh << EOF
1
y
y
y
EOF
