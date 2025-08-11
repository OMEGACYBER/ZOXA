// 🧪 Complete ZOXAA System Test - Verify All Features
// Tests emotional intelligence, crisis detection, memory system, and voice processing

const { EnhancedEmotionalSystem } = require('./src/utils/enhancedEmotionalSystem.ts');
const { ConversationMemoryManager } = require('./src/utils/conversationMemory.ts');
const { CrisisDetectionSystem } = require('./src/utils/crisisDetection.ts');
const { EVI3VoiceAnalyzer } = require('./src/utils/advancedVoiceAnalysis.ts');

class CompleteSystemTest {
  constructor() {
    this.emotionalSystem = new EnhancedEmotionalSystem(false); // Debug mode
    this.memoryManager = ConversationMemoryManager.getInstance();
    this.crisisDetection = new CrisisDetectionSystem();
    this.voiceAnalyzer = new EVI3VoiceAnalyzer();
    
    this.testResults = {
      emotionalIntelligence: { passed: 0, failed: 0, tests: [] },
      crisisDetection: { passed: 0, failed: 0, tests: [] },
      memorySystem: { passed: 0, failed: 0, tests: [] },
      voiceAnalysis: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] }
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Complete ZOXAA System Test...\n');
    
    await this.testEmotionalIntelligence();
    await this.testCrisisDetection();
    await this.testMemorySystem();
    await this.testVoiceAnalysis();
    await this.testIntegration();
    
    this.printResults();
  }

  async testEmotionalIntelligence() {
    console.log('🧠 Testing Emotional Intelligence System...');
    
    const testCases = [
      {
        name: 'Joy Detection',
        text: 'I am so happy today! This is amazing!',
        expectedEmotion: 'joy',
        expectedIntensity: 0.7
      },
      {
        name: 'Sadness Detection',
        text: 'I feel so sad and hopeless. Nothing matters anymore.',
        expectedEmotion: 'sadness',
        expectedIntensity: 0.8
      },
      {
        name: 'Anger Detection',
        text: 'I am furious! This is completely unacceptable!',
        expectedEmotion: 'anger',
        expectedIntensity: 0.9
      },
      {
        name: 'Fear Detection',
        text: 'I am scared and anxious about what might happen.',
        expectedEmotion: 'fear',
        expectedIntensity: 0.7
      },
      {
        name: 'Neutral Detection',
        text: 'The weather is nice today.',
        expectedEmotion: 'neutral',
        expectedIntensity: 0.3
      }
    ];

    for (const testCase of testCases) {
      try {
        const result = await this.emotionalSystem.analyzeEmotion(testCase.text, 'test_session');
        
        const emotionMatch = result.primaryEmotion === testCase.expectedEmotion;
        const intensityMatch = Math.abs(result.emotionalIntensity - testCase.expectedIntensity) < 0.3;
        
        if (emotionMatch && intensityMatch) {
          this.testResults.emotionalIntelligence.passed++;
          this.testResults.emotionalIntelligence.tests.push({
            name: testCase.name,
            status: 'PASSED',
            details: `Detected: ${result.primaryEmotion} (${Math.round(result.emotionalIntensity * 100)}%)`
          });
        } else {
          this.testResults.emotionalIntelligence.failed++;
          this.testResults.emotionalIntelligence.tests.push({
            name: testCase.name,
            status: 'FAILED',
            details: `Expected: ${testCase.expectedEmotion}, Got: ${result.primaryEmotion}`
          });
        }
      } catch (error) {
        this.testResults.emotionalIntelligence.failed++;
        this.testResults.emotionalIntelligence.tests.push({
          name: testCase.name,
          status: 'ERROR',
          details: error.message
        });
      }
    }
  }

  async testCrisisDetection() {
    console.log('🚨 Testing Crisis Detection System...');
    
    const testCases = [
      {
        name: 'No Crisis',
        text: 'I had a good day today.',
        expectedLevel: 'none',
        expectedRisk: 0.2
      },
      {
        name: 'Low Crisis - Hopelessness',
        text: 'I feel hopeless about my future.',
        expectedLevel: 'low',
        expectedRisk: 0.4
      },
      {
        name: 'Medium Crisis - Self Harm',
        text: 'I sometimes think about hurting myself.',
        expectedLevel: 'medium',
        expectedRisk: 0.6
      },
      {
        name: 'High Crisis - Suicidal Ideation',
        text: 'I want to end my life. I can\'t go on anymore.',
        expectedLevel: 'high',
        expectedRisk: 0.8
      },
      {
        name: 'Critical Crisis - Immediate Danger',
        text: 'I am going to kill myself tonight. I have a plan.',
        expectedLevel: 'critical',
        expectedRisk: 0.9
      }
    ];

    for (const testCase of testCases) {
      try {
        const result = this.crisisDetection.detectCrisis(testCase.text);
        
        const levelMatch = result.crisisLevel === testCase.expectedLevel;
        const riskMatch = Math.abs(result.overallRisk - testCase.expectedRisk) < 0.3;
        
        if (levelMatch && riskMatch) {
          this.testResults.crisisDetection.passed++;
          this.testResults.crisisDetection.tests.push({
            name: testCase.name,
            status: 'PASSED',
            details: `Detected: ${result.crisisLevel} (${Math.round(result.overallRisk * 100)}% risk)`
          });
        } else {
          this.testResults.crisisDetection.failed++;
          this.testResults.crisisDetection.tests.push({
            name: testCase.name,
            status: 'FAILED',
            details: `Expected: ${testCase.expectedLevel}, Got: ${result.crisisLevel}`
          });
        }
      } catch (error) {
        this.testResults.crisisDetection.failed++;
        this.testResults.crisisDetection.tests.push({
          name: testCase.name,
          status: 'ERROR',
          details: error.message
        });
      }
    }
  }

  async testMemorySystem() {
    console.log('🧠 Testing Memory System...');
    
    const testCases = [
      {
        name: 'Memory Creation',
        userId: 'test_user_1',
        interaction: {
          emotion: 'joy',
          topics: ['work', 'success'],
          message: 'I got promoted at work!',
          emotionalIntensity: 0.8
        }
      },
      {
        name: 'Memory Retrieval',
        userId: 'test_user_1',
        expectedTopics: ['work', 'success'],
        expectedEmotion: 'joy'
      },
      {
        name: 'Memory Update',
        userId: 'test_user_1',
        interaction: {
          emotion: 'sadness',
          topics: ['work', 'stress'],
          message: 'Work is really stressful now.',
          emotionalIntensity: 0.6
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        if (testCase.interaction) {
          // Test memory creation/update
          this.memoryManager.updateMemory(testCase.userId, testCase.interaction);
          const memory = this.memoryManager.getMemory(testCase.userId);
          
          if (memory.totalInteractions > 0) {
            this.testResults.memorySystem.passed++;
            this.testResults.memorySystem.tests.push({
              name: testCase.name,
              status: 'PASSED',
              details: `Memory updated: ${memory.totalInteractions} interactions`
            });
          } else {
            this.testResults.memorySystem.failed++;
            this.testResults.memorySystem.tests.push({
              name: testCase.name,
              status: 'FAILED',
              details: 'Memory not created'
            });
          }
        } else {
          // Test memory retrieval
          const memory = this.memoryManager.getMemory(testCase.userId);
          const context = this.memoryManager.getPersonalizedContext(testCase.userId, 'neutral');
          
          if (context.importantTopics.length > 0) {
            this.testResults.memorySystem.passed++;
            this.testResults.memorySystem.tests.push({
              name: testCase.name,
              status: 'PASSED',
              details: `Retrieved: ${context.importantTopics.length} topics`
            });
          } else {
            this.testResults.memorySystem.failed++;
            this.testResults.memorySystem.tests.push({
              name: testCase.name,
              status: 'FAILED',
              details: 'No topics retrieved'
            });
          }
        }
      } catch (error) {
        this.testResults.memorySystem.failed++;
        this.testResults.memorySystem.tests.push({
          name: testCase.name,
          status: 'ERROR',
          details: error.message
        });
      }
    }
  }

  async testVoiceAnalysis() {
    console.log('🎤 Testing Voice Analysis System...');
    
    // Create mock audio data for testing
    const mockAudioData = new Float32Array(1024);
    for (let i = 0; i < mockAudioData.length; i++) {
      mockAudioData[i] = Math.random() * 0.5 + 0.25; // Simulate voice data
    }
    
    const testCases = [
      {
        name: 'Voice Metrics Analysis',
        audioData: mockAudioData,
        expectedMetrics: ['pitch', 'tempo', 'volume', 'stress']
      },
      {
        name: 'Crisis Detection from Voice',
        audioData: mockAudioData,
        expectedCrisisLevel: 'none'
      },
      {
        name: 'Emotion Detection from Voice',
        audioData: mockAudioData,
        expectedEmotion: 'neutral'
      }
    ];

    for (const testCase of testCases) {
      try {
        const voiceMetrics = this.voiceAnalyzer.analyzeVoiceProsody(testCase.audioData);
        const crisisLevel = this.voiceAnalyzer.detectVoiceCrisis(testCase.audioData);
        const emotionStream = this.voiceAnalyzer.getVoiceEmotionStream(testCase.audioData);
        
        const metricsPresent = testCase.expectedMetrics.every(metric => 
          voiceMetrics.prosody.hasOwnProperty(metric) || voiceMetrics.voiceCharacteristics.hasOwnProperty(metric)
        );
        
        if (metricsPresent && crisisLevel && emotionStream) {
          this.testResults.voiceAnalysis.passed++;
          this.testResults.voiceAnalysis.tests.push({
            name: testCase.name,
            status: 'PASSED',
            details: `Crisis: ${crisisLevel}, Emotion: ${emotionStream.emotionalState.primaryEmotion}`
          });
        } else {
          this.testResults.voiceAnalysis.failed++;
          this.testResults.voiceAnalysis.tests.push({
            name: testCase.name,
            status: 'FAILED',
            details: 'Voice analysis incomplete'
          });
        }
      } catch (error) {
        this.testResults.voiceAnalysis.failed++;
        this.testResults.voiceAnalysis.tests.push({
          name: testCase.name,
          status: 'ERROR',
          details: error.message
        });
      }
    }
  }

  async testIntegration() {
    console.log('🔗 Testing System Integration...');
    
    const testCases = [
      {
        name: 'End-to-End Conversation',
        messages: [
          'Hello, I am feeling sad today.',
          'I have been thinking about ending my life.',
          'Thank you for listening to me.'
        ],
        expectedCrisis: 'high',
        expectedEmotions: ['sadness', 'sadness', 'gratitude']
      }
    ];

    for (const testCase of testCases) {
      try {
        let sessionId = 'integration_test';
        let crisisDetected = false;
        let emotionsDetected = [];
        
        for (const message of testCase.messages) {
          // Test emotional analysis
          const emotion = await this.emotionalSystem.analyzeEmotion(message, sessionId);
          emotionsDetected.push(emotion.primaryEmotion);
          
          // Test crisis detection
          const crisis = this.crisisDetection.detectCrisis(message);
          if (crisis.crisisLevel !== 'none') {
            crisisDetected = true;
          }
          
          // Test memory update
          this.memoryManager.updateMemory(sessionId, {
            emotion: emotion.primaryEmotion,
            topics: ['conversation'],
            message: message,
            emotionalIntensity: emotion.emotionalIntensity
          });
        }
        
        const emotionMatch = emotionsDetected.some(emotion => 
          testCase.expectedEmotions.includes(emotion)
        );
        const crisisMatch = crisisDetected;
        
        if (emotionMatch && crisisMatch) {
          this.testResults.integration.passed++;
          this.testResults.integration.tests.push({
            name: testCase.name,
            status: 'PASSED',
            details: `Emotions: ${emotionsDetected.join(', ')}, Crisis: ${crisisDetected}`
          });
        } else {
          this.testResults.integration.failed++;
          this.testResults.integration.tests.push({
            name: testCase.name,
            status: 'FAILED',
            details: `Expected emotions: ${testCase.expectedEmotions}, Got: ${emotionsDetected}`
          });
        }
      } catch (error) {
        this.testResults.integration.failed++;
        this.testResults.integration.tests.push({
          name: testCase.name,
          status: 'ERROR',
          details: error.message
        });
      }
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    Object.entries(this.testResults).forEach(([system, results]) => {
      const total = results.passed + results.failed;
      const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
      
      console.log(`\n${system.toUpperCase()}:`);
      console.log(`  Passed: ${results.passed}/${total} (${percentage}%)`);
      
      if (results.failed > 0) {
        console.log('  Failed Tests:');
        results.tests.filter(t => t.status === 'FAILED' || t.status === 'ERROR').forEach(test => {
          console.log(`    - ${test.name}: ${test.details}`);
        });
      }
      
      totalPassed += results.passed;
      totalFailed += results.failed;
    });
    
    const overallTotal = totalPassed + totalFailed;
    const overallPercentage = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;
    
    console.log('\n🎯 Overall Results:');
    console.log(`  Total Passed: ${totalPassed}/${overallTotal} (${overallPercentage}%)`);
    
    if (overallPercentage >= 80) {
      console.log('✅ ZOXAA System is READY for production!');
    } else if (overallPercentage >= 60) {
      console.log('⚠️  ZOXAA System needs improvements before production.');
    } else {
      console.log('❌ ZOXAA System needs significant work before production.');
    }
  }
}

// Run the complete test
if (require.main === module) {
  const test = new CompleteSystemTest();
  test.runAllTests().catch(console.error);
}

module.exports = CompleteSystemTest;
