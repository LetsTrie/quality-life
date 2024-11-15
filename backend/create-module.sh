#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: ./create_module.sh <project-directory> <module-name>"
  exit 1
fi

# Extract arguments
PROJECT_DIR="$1"
MODULE_NAME="$2"

# Check if the project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: Project directory '$PROJECT_DIR' not found!"
  exit 1
fi

# Navigate to the project directory
cd "$PROJECT_DIR" || {
  echo "Error: Unable to navigate to project directory '$PROJECT_DIR'!"
  exit 1
}

# Create the directory with the module name
mkdir -p "$MODULE_NAME" || {
  echo "Error: Unable to create module directory '$MODULE_NAME'!"
  exit 1
}

# Navigate into the module directory
cd "$MODULE_NAME" || {
  echo "Error: Unable to navigate to module directory '$MODULE_NAME'!"
  exit 1
}

# Create files inside the directory
touch "${MODULE_NAME}.controller.js"
touch "${MODULE_NAME}.helper.js"
touch "${MODULE_NAME}.service.js"
touch "${MODULE_NAME}.route.js"
touch "${MODULE_NAME}.validation.js"
touch "${MODULE_NAME}.model.js"

cat <<EOF > "${MODULE_NAME}.route.js"
const express = require('express');
const router = express.Router();

// Middleware to handle requests
router.use((req, res, next) => {
  // Add middleware logic here
  next();
});

// Route definitions
router.get('/', (req, res) => {
  res.send('Hello from ${MODULE_NAME} route!');
});

module.exports = router;
EOF

echo "Module '$MODULE_NAME' created successfully in '$PROJECT_DIR/$MODULE_NAME'!"
