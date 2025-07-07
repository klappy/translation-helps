/**
 * LivePlaygroundDemo.jsx
 * ACTUAL live interactive playground - not just documentation!
 * Provides real code editing and live component preview
 */

import React, { useState, useEffect } from 'react';
import styles from './LivePlaygroundDemo.module.css';

export function LivePlaygroundDemo() {
  const [selectedExample, setSelectedExample] = useState('simple-test');
  const [code, setCode] = useState('');
  const [liveData, setLiveData] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Example code templates
  const examples = {
    'simple-test': {
      name: '🧪 Simple Test',
      description: 'Quick test to verify the playground works',
      code: `// Simple Test - Try this first!
console.log('🎯 Playground is working!');
console.log('Current time:', new Date().toLocaleTimeString());

const testData = {
  status: 'success',
  message: 'The Live Playground is fully functional!',
  features: ['console output', 'JSON results', 'async support'],
  timestamp: Date.now()
};

console.log('Test data:', testData);

// Return the result
return testData;`,
      initialData: null
    },
    
    'basic-reference': {
      name: '📖 Basic Reference Loading',
      description: 'See how simple verse loading works',
      code: `// Simple Reference Loading Example
const reference = { 
  book: 'tit', 
  chapter: 1, 
  verse: 1 
};

// Simulate the Simple Verse-Loading Pattern
const loadReference = async (ref) => {
  console.log('Loading:', ref);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    scripture: \`Titus \${ref.chapter}:\${ref.verse} - Paul, a servant of God and an apostle of Jesus Christ...\`,
    notes: [
      { id: 1, text: "Paul was the author of this letter." },
      { id: 2, text: "This introduces Paul's credentials." }
    ],
    words: [
      { word: "Paul", definition: "The apostle who wrote this letter" },
      { word: "servant", definition: "One who serves God faithfully" }
    ]
  };
};

// Execute the loading and return the result
const result = await loadReference(reference);
console.log('✅ Loaded:', result);
return result;`,
      initialData: null
    },
    
    'theme-switching': {
      name: '🎨 Live Theme System',
      description: 'Interactive theme switching demo',
      code: `// Theme System Demo
const themes = {
  light: {
    background: '#ffffff',
    text: '#212529',
    primary: '#007bff',
    surface: '#f8f9fa'
  },
  dark: {
    background: '#0f172a',
    text: '#f1f5f9', 
    primary: '#3b82f6',
    surface: '#1e293b'
  }
};

let currentTheme = 'light';

const switchTheme = () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  console.log(\`🎨 Switched to \${currentTheme} theme\`);
  
  const theme = themes[currentTheme];
  console.log('Theme colors:', theme);
  
  return {
    theme: currentTheme,
    colors: theme,
    message: \`Successfully switched to \${currentTheme} mode!\`
  };
};

// Try switching themes
const result1 = switchTheme();
console.log('First switch:', result1);

const result2 = switchTheme();
console.log('Second switch:', result2);

// Return the final result
return result2;`,
      initialData: null
    },

    'error-handling': {
      name: '🛡️ Error Recovery System',
      description: 'See graceful error handling in action',
      code: `// Error Handling & Recovery Demo
class ResilientAPI {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
  }
  
  async fetchWithRetry(url, options = {}) {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(\`📡 Attempt \${attempt + 1}/\${this.maxRetries + 1}: \${url}\`);
        
        // Simulate different outcomes
        const success = Math.random() > 0.3; // 70% success rate
        
        if (!success && attempt < this.maxRetries) {
          throw new Error(\`Network timeout (attempt \${attempt + 1})\`);
        }
        
        if (!success) {
          throw new Error('All retries exhausted');
        }
        
        // Simulate successful response
        await new Promise(r => setTimeout(r, 200));
        console.log('✅ Success! Data retrieved.');
        
        return {
          success: true,
          data: { message: 'Resource loaded successfully!' },
          attempts: attempt + 1,
          cached: false
        };
        
      } catch (error) {
        console.log(\`❌ Error: \${error.message}\`);
        
        if (attempt === this.maxRetries) {
          console.log('🛡️ Switching to fallback content...');
          return {
            success: false,
            fallback: true,
            data: { message: 'Showing cached content while retrying...' },
            attempts: attempt + 1
          };
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(\`⏳ Waiting \${delay}ms before retry...\`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
}

// Test the resilient API and return the result
const api = new ResilientAPI();
const result = await api.fetchWithRetry('/api/translation-notes');
console.log('Final result:', result);
return result;`,
      initialData: null
    },

    'performance-test': {
      name: '⚡ Performance Comparison',
      description: 'Compare old vs new loading speeds',
      code: `// Performance Testing Demo
const performanceTest = {
  // Simulate old architecture
  oldArchitecture: async () => {
    console.log('🐌 Testing OLD architecture...');
    const start = performance.now();
    
    // Simulate multiple sequential API calls
    await new Promise(r => setTimeout(r, 800)); // manifest
    await new Promise(r => setTimeout(r, 600)); // parse
    await new Promise(r => setTimeout(r, 400)); // find book
    await new Promise(r => setTimeout(r, 1200)); // load content
    
    const duration = performance.now() - start;
    console.log(\`OLD: \${duration.toFixed(0)}ms\`);
    
    return {
      architecture: 'old',
      duration: Math.round(duration),
      steps: ['fetch manifest', 'parse manifest', 'find book', 'load content'],
      efficiency: 'poor'
    };
  },
  
  // Simulate new architecture  
  newArchitecture: async () => {
    console.log('⚡ Testing NEW architecture...');
    const start = performance.now();
    
    // Simulate direct API call
    await new Promise(r => setTimeout(r, 300)); // direct call
    
    const duration = performance.now() - start;
    console.log(\`NEW: \${duration.toFixed(0)}ms\`);
    
    return {
      architecture: 'new', 
      duration: Math.round(duration),
      steps: ['direct API call'],
      efficiency: 'excellent'
    };
  }
};

// Run comparison test and return the result
const comparison = async () => {
  const oldResult = await performanceTest.oldArchitecture();
  const newResult = await performanceTest.newArchitecture();
  
  const improvement = Math.round(
    ((oldResult.duration - newResult.duration) / oldResult.duration) * 100
  );
  
  console.log(\`🚀 Performance improvement: \${improvement}%\`);
  
  return {
    old: oldResult,
    new: newResult,
    improvement: \`\${improvement}%\`,
    summary: \`\${improvement}% faster with new architecture!\`
  };
};

// Execute and return the comparison result
const result = await comparison();
return result;`,
      initialData: null
    }
  };

  // Set initial code when example changes
  useEffect(() => {
    setCode(examples[selectedExample].code);
    setLiveData(examples[selectedExample].initialData);
  }, [selectedExample]);

  // Execute the code
  const executeCode = async () => {
    setIsExecuting(true);
    setLiveData(null);

    // Capture console output
    const consoleOutput = [];
    const originalConsoleLog = console.log;
    
    // Override console.log to capture output
    console.log = (...args) => {
      consoleOutput.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
      originalConsoleLog(...args); // Still show in browser console
    };

    try {
      // Create a safe execution environment
      const executeFunction = new Function(`
        return (async () => {
          try {
            ${code}
          } catch (error) {
            console.log('❌ Execution Error:', error.message);
            throw error;
          }
        })();
      `);

      const result = await executeFunction();
      
      // Restore original console.log
      console.log = originalConsoleLog;
      
      setLiveData({
        result: result,
        consoleOutput: consoleOutput,
        success: true,
        executedAt: new Date().toLocaleTimeString()
      });
      
    } catch (error) {
      // Restore original console.log
      console.log = originalConsoleLog;
      
      setLiveData({
        error: true,
        message: error.message,
        type: 'execution-error',
        consoleOutput: consoleOutput,
        executedAt: new Date().toLocaleTimeString()
      });
    }

    setIsExecuting(false);
  };

  const formatOutput = (data) => {
    if (!data) return 'No output';
    
    if (data.error) {
      return `❌ Error: ${data.message}\n\n📝 Console Output:\n${data.consoleOutput?.join('\n') || 'No console output'}`;
    }
    
    if (data.success) {
      let output = '';
      
      // Show the result
      if (data.result !== undefined) {
        output += `✅ Result:\n${JSON.stringify(data.result, null, 2)}\n\n`;
      }
      
      // Show console output
      if (data.consoleOutput && data.consoleOutput.length > 0) {
        output += `📝 Console Output:\n${data.consoleOutput.join('\n')}\n\n`;
      }
      
      output += `⏰ Executed at: ${data.executedAt}`;
      
      return output;
    }
    
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className={styles.playgroundContainer} data-testid="live-playground-demo">
      <div className={styles.playgroundHeader}>
        <h3 className={styles.playgroundTitle}>🎮 Live Interactive Playground</h3>
        <p className={styles.playgroundDescription}>
          Real code execution with live results - modify and run the examples below!
        </p>
      </div>

      <div className={styles.playgroundLayout}>
        {/* Example Selection */}
        <div className={styles.exampleSelector}>
          <h4>Choose Example to Run</h4>
          <div className={styles.exampleButtons}>
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                className={`${styles.exampleButton} ${selectedExample === key ? styles.active : ''}`}
                onClick={() => setSelectedExample(key)}
                data-testid={`example-${key}`}
              >
                <div className={styles.exampleName}>{example.name}</div>
                <div className={styles.exampleDescription}>{example.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className={styles.codeSection}>
          <div className={styles.codeHeader}>
            <h4>📝 Live Code Editor</h4>
            <button
              className={styles.executeButton}
              onClick={executeCode}
              disabled={isExecuting}
              data-testid="execute-button"
            >
              {isExecuting ? '⏳ Running...' : '▶️ Execute Code'}
            </button>
          </div>
          
          <textarea
            className={styles.codeEditor}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            data-testid="code-editor"
          />
        </div>

        {/* Live Output */}
        <div className={styles.outputSection}>
          <h4>📊 Live Output</h4>
          <div className={styles.outputContainer} data-testid="output-container">
            {isExecuting ? (
              <div className={styles.loadingOutput}>
                <div className={styles.loadingSpinner}></div>
                <span>Executing code...</span>
              </div>
            ) : (
              <pre className={styles.outputContent}>
                {formatOutput(liveData)}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Console */}
      <div className={styles.consoleSection}>
        <h4>💻 Interactive Console Log</h4>
        <div className={styles.consoleOutput} data-testid="console-output">
          <div className={styles.consoleLine}>
            <span className={styles.consolePrompt}>→</span>
            <span>Ready to execute code! Select an example above and click "Execute Code"</span>
          </div>
          <div className={styles.consoleLine}>
            <span className={styles.consolePrompt}>→</span>
            <span>Modify the code in the editor to experiment with different scenarios</span>
          </div>
          <div className={styles.consoleLine}>
            <span className={styles.consolePrompt}>→</span>
            <span className={styles.consoleHighlight}>This is a REAL playground - the code actually executes!</span>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className={styles.featureHighlights}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>⚡</span>
          <span>Real code execution</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🔧</span>
          <span>Live editing & modification</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📊</span>
          <span>Instant result preview</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🎯</span>
          <span>Learn by doing</span>
        </div>
      </div>
    </div>
  );
} 