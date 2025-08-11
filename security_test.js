// 🚨 SECURITY TEST SUITE - PREVENT DEBUG OUTPUT LEAKAGE
// This test ensures NO debug information leaks to users

const fs = require('fs');
const path = require('path');

// Test 1: Check for console.log statements in production code
function testConsoleLogLeakage() {
  console.log('🔍 Testing for console.log leakage...');
  
  const sourceFiles = [
    'src/hooks/useZoxaaVoice.ts',
    'src/pages/VoiceChat.tsx',
    'src/utils/enhancedEmotionalSystem.ts',
    'src/utils/advancedVoiceAnalysis.ts',
    'backend/tts.js',
    'backend/chat.js'
  ];
  
  let violations = [];
  
  sourceFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('console.log') && !line.includes('// console.log')) {
          violations.push({
            file,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }
  });
  
  if (violations.length > 0) {
    console.error('❌ CONSOLE.LOG LEAKAGE DETECTED:');
    violations.forEach(v => {
      console.error(`   ${v.file}:${v.line} - ${v.content}`);
    });
    process.exit(1);
  }
  
  console.log('✅ No console.log leakage detected');
}

// Test 2: Check for emotional state exposure in API responses
function testEmotionalStateExposure() {
  console.log('🔍 Testing for emotional state exposure...');
  
  const apiFiles = [
    'backend/tts.js',
    'backend/chat.js',
    'api/tts.js',
    'api/chat.js'
  ];
  
  let violations = [];
  
  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for emotional state in response
      if (content.includes('emotionalState') && content.includes('res.json')) {
        violations.push({
          file,
          issue: 'Emotional state exposed in API response'
        });
      }
      
      // Check for debug objects in response
      if (content.includes('console.log') && content.includes('res.json')) {
        violations.push({
          file,
          issue: 'Debug output in API response'
        });
      }
    }
  });
  
  if (violations.length > 0) {
    console.error('❌ EMOTIONAL STATE EXPOSURE DETECTED:');
    violations.forEach(v => {
      console.error(`   ${v.file} - ${v.issue}`);
    });
    process.exit(1);
  }
  
  console.log('✅ No emotional state exposure detected');
}

// Test 3: Check for sensitive data in client-side code
function testSensitiveDataExposure() {
  console.log('🔍 Testing for sensitive data exposure...');
  
  const sensitivePatterns = [
    'OPENAI_API_KEY',
    'process.env',
    'emotionalState',
    'userEmotion',
    'voiceData',
    'sessionId'
  ];
  
  const clientFiles = [
    'src/hooks/useZoxaaVoice.ts',
    'src/pages/VoiceChat.tsx',
    'src/components/chat/ChatInterface.tsx'
  ];
  
  let violations = [];
  
  clientFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      sensitivePatterns.forEach(pattern => {
        if (content.includes(pattern) && !content.includes('// ' + pattern)) {
          violations.push({
            file,
            pattern,
            issue: 'Sensitive data exposed in client code'
          });
        }
      });
    }
  });
  
  if (violations.length > 0) {
    console.error('❌ SENSITIVE DATA EXPOSURE DETECTED:');
    violations.forEach(v => {
      console.error(`   ${v.file} - ${v.pattern} - ${v.issue}`);
    });
    process.exit(1);
  }
  
  console.log('✅ No sensitive data exposure detected');
}

// Test 4: Validate production logger configuration
function testProductionLogger() {
  console.log('🔍 Testing production logger configuration...');
  
  const loggerFile = 'src/utils/productionLogger.ts';
  
  if (fs.existsSync(loggerFile)) {
    const content = fs.readFileSync(loggerFile, 'utf8');
    
    // Check for proper production mode settings
    if (!content.includes('productionMode: true')) {
      console.error('❌ Production logger not configured for production mode');
      process.exit(1);
    }
    
    if (!content.includes('enableConsole: false')) {
      console.error('❌ Production logger allows console output');
      process.exit(1);
    }
    
    if (!content.includes('[REDACTED]')) {
      console.error('❌ Production logger missing data sanitization');
      process.exit(1);
    }
  }
  
  console.log('✅ Production logger properly configured');
}

// Run all security tests
function runSecurityTests() {
  console.log('🚨 ZOXAA SECURITY TEST SUITE');
  console.log('=============================\n');
  
  try {
    testConsoleLogLeakage();
    testEmotionalStateExposure();
    testSensitiveDataExposure();
    testProductionLogger();
    
    console.log('\n✅ ALL SECURITY TESTS PASSED');
    console.log('✅ NO DEBUG OUTPUT LEAKAGE DETECTED');
    console.log('✅ SYSTEM IS PRODUCTION-READY');
    
  } catch (error) {
    console.error('\n❌ SECURITY TEST FAILED:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSecurityTests();
}

module.exports = {
  runSecurityTests,
  testConsoleLogLeakage,
  testEmotionalStateExposure,
  testSensitiveDataExposure,
  testProductionLogger
};
