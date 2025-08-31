#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function buildWebui() {
  console.log('🧹 Cleaning existing dist directories...');
  
  // Remove existing directories
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  if (fs.existsSync('webui/dist')) {
    fs.rmSync('webui/dist', { recursive: true, force: true });
  }

  console.log('📦 Building webui...');
  
  // Change to webui directory and run expo export
  try {
    execSync('cd webui && npx expo export -p web --output-dir dist', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('📁 Copying webui/dist to root dist...');
    
    // Copy webui/dist to root dist (more reliable on Windows)
    if (fs.existsSync('webui/dist')) {
      // Ensure target doesn't exist
      if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
      }
      // Copy instead of rename to avoid Windows file lock issues
      fs.cpSync('webui/dist', 'dist', { recursive: true });
      // Clean up source
      fs.rmSync('webui/dist', { recursive: true, force: true });
      console.log('✅ Webui build complete! Output in dist/');
    } else {
      throw new Error('webui/dist directory not created');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  buildWebui();
}

module.exports = { buildWebui };