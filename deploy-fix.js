// deploy-fix.js - Manual deployment script
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting manual deployment fix...');

try {
  // 1. Add all changes
  console.log('📝 Adding changes to git...');
  execSync('git add .', { stdio: 'inherit' });
  
  // 2. Commit changes
  console.log('💾 Committing changes...');
  execSync('git commit -m "Fix worker permissions and disable temporarily"', { stdio: 'inherit' });
  
  // 3. Push to origin
  console.log('📤 Pushing to origin...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('✅ Deployment fix applied successfully!');
  console.log('🌐 Your app should redeploy automatically on Render.');
  
} catch (error) {
  console.error('❌ Error during deployment:', error.message);
  console.log('📋 Manual steps:');
  console.log('1. Go to your GitHub repository');
  console.log('2. Upload the modified files manually');
  console.log('3. Or try: git add . && git commit -m "fix" && git push');
}
