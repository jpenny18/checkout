const fs = require('fs');
const path = require('path');
require('dotenv').config();

function prepareForSquarespace() {
  const htmlFile = path.join(__dirname, 'public', 'thebestcheckout.html');
  let html = fs.readFileSync(htmlFile, 'utf8');
  
  // Replace development settings with production ones
  const replacements = {
    'STRIPE_PUBLISHABLE_KEY_PLACEHOLDER': process.env.STRIPE_PUBLISHABLE_KEY,
    'http://localhost:3001': 'https://your-api-domain.com', // Update with your actual API domain
    'development': 'production'
  };

  // Apply replacements
  Object.entries(replacements).forEach(([key, value]) => {
    html = html.replace(new RegExp(key, 'g'), value);
  });

  // Create deployment folder
  const deployDir = path.join(__dirname, 'deploy');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
  }

  // Write prepared files
  fs.writeFileSync(
    path.join(deployDir, 'squarespace-checkout.html'),
    html
  );

  // Copy success page
  const successFile = path.join(__dirname, 'public', 'success.html');
  if (fs.existsSync(successFile)) {
    fs.copyFileSync(
      successFile,
      path.join(deployDir, 'success.html')
    );
  }

  console.log('Files prepared for Squarespace deployment!');
}

prepareForSquarespace(); 