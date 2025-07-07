/**
 * ErrorHandlingDemo.jsx
 * Interactive demonstration of error handling and recovery
 * Shows graceful fallbacks, retry logic, and user-friendly error states
 */

import React, { useState, useEffect } from 'react';
import styles from './ErrorHandlingDemo.module.css';

export function ErrorHandlingDemo() {
  const [errorScenario, setErrorScenario] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [errorLog, setErrorLog] = useState([]);
  const [recoveryState, setRecoveryState] = useState('idle');
  const [retryCount, setRetryCount] = useState(0);

  // Error scenario definitions
  const errorScenarios = [
    {
      id: 'network-timeout',
      name: 'Network Timeout',
      description: 'Simulate slow/failing network connection',
      icon: '🌐',
      color: '#f59e0b',
      duration: 3000,
      retryable: true
    },
    {
      id: 'server-error',
      name: 'Server Error (500)',
      description: 'Backend service temporarily unavailable', 
      icon: '🔧',
      color: '#ef4444',
      duration: 2000,
      retryable: true
    },
    {
      id: 'rate-limit',
      name: 'Rate Limiting (429)',
      description: 'Too many requests, need to back off',
      icon: '⏱️',
      color: '#8b5cf6',
      duration: 4000,
      retryable: true
    },
    {
      id: 'invalid-data',
      name: 'Invalid Response',
      description: 'Malformed data from API',
      icon: '📋',
      color: '#06b6d4',
      duration: 1500,
      retryable: false
    },
    {
      id: 'resource-not-found',
      name: 'Resource Not Found (404)',
      description: 'Requested content does not exist',
      icon: '🔍',
      color: '#84cc16',
      duration: 1000,
      retryable: false
    }
  ];

  // Simulate error scenario
  const simulateError = async (scenario) => {
    setIsSimulating(true);
    setErrorScenario(scenario);
    setErrorLog([]);
    setRecoveryState('idle');
    setRetryCount(0);

    // Log initial error
    addToErrorLog('error', `${scenario.name} detected`, scenario.description);

    // Simulate error detection delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (scenario.retryable) {
      setRecoveryState('attempting-recovery');
      await attemptRecovery(scenario);
    } else {
      setRecoveryState('showing-fallback');
      addToErrorLog('info', 'Non-retryable error', 'Showing fallback content immediately');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecoveryState('fallback-shown');
    }

    setIsSimulating(false);
  };

  // Recovery simulation
  const attemptRecovery = async (scenario) => {
    const maxRetries = 3;
    let currentRetry = 0;

    while (currentRetry < maxRetries) {
      setRetryCount(currentRetry + 1);
      addToErrorLog('info', `Retry attempt ${currentRetry + 1}/${maxRetries}`, 'Attempting to recover...');
      
      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, currentRetry), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Simulate recovery attempt (70% success rate after retry 2)
      const recoveryChance = currentRetry === 0 ? 0.2 : currentRetry === 1 ? 0.5 : 0.8;
      const recovered = Math.random() < recoveryChance;

      if (recovered) {
        addToErrorLog('success', 'Recovery successful!', 'Connection restored, resuming normal operation');
        setRecoveryState('recovered');
        return;
      } else {
        addToErrorLog('warning', `Retry ${currentRetry + 1} failed`, 'Still experiencing issues...');
        currentRetry++;
      }
    }

    // All retries failed
    addToErrorLog('error', 'All retries exhausted', 'Switching to fallback content');
    setRecoveryState('showing-fallback');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRecoveryState('fallback-shown');
  };

  // Add log entry
  const addToErrorLog = (type, title, message) => {
    const entry = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setErrorLog(prev => [...prev, entry]);
  };

  const resetDemo = () => {
    setErrorScenario(null);
    setIsSimulating(false);
    setErrorLog([]);
    setRecoveryState('idle');
    setRetryCount(0);
  };

  const getRecoveryStateDisplay = () => {
    switch (recoveryState) {
      case 'idle':
        return { text: 'Ready', color: '#6b7280', icon: '⚪' };
      case 'attempting-recovery':
        return { text: 'Recovering...', color: '#f59e0b', icon: '🔄' };
      case 'recovered':
        return { text: 'Recovered!', color: '#10b981', icon: '✅' };
      case 'showing-fallback':
        return { text: 'Loading Fallback...', color: '#8b5cf6', icon: '🔀' };
      case 'fallback-shown':
        return { text: 'Fallback Active', color: '#06b6d4', icon: '🛡️' };
      default:
        return { text: 'Unknown', color: '#6b7280', icon: '❓' };
    }
  };

  return (
    <div className={styles.demoContainer} data-testid="error-handling-demo">
      <div className={styles.demoPanel}>
        <h3 className={styles.demoTitle}>Live Error Handling Demo</h3>
        
        <div className={styles.errorHandlingContainer}>
          {/* Error Scenarios */}
          <div className={styles.scenarioSelection}>
            <h4>Select Error Scenario to Simulate</h4>
            <div className={styles.scenarioGrid}>
              {errorScenarios.map(scenario => (
                <button
                  key={scenario.id}
                  className={`${styles.scenarioButton} ${
                    errorScenario?.id === scenario.id ? styles.active : ''
                  }`}
                  onClick={() => simulateError(scenario)}
                  disabled={isSimulating}
                  data-testid={`scenario-${scenario.id}`}
                  style={{ '--scenario-color': scenario.color }}
                >
                  <div className={styles.scenarioIcon}>{scenario.icon}</div>
                  <div className={styles.scenarioName}>{scenario.name}</div>
                  <div className={styles.scenarioDescription}>{scenario.description}</div>
                  <div className={styles.scenarioMeta}>
                    {scenario.retryable ? '🔄 Retryable' : '🚫 Non-retryable'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className={styles.systemStatus}>
            <div className={styles.statusHeader}>
              <h4>System Status</h4>
              <button
                className={styles.resetButton}
                onClick={resetDemo}
                disabled={isSimulating}
                data-testid="reset-button"
              >
                Reset Demo
              </button>
            </div>
            
            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <div className={styles.statusLabel}>Current State</div>
                <div 
                  className={styles.statusValue}
                  style={{ color: getRecoveryStateDisplay().color }}
                >
                  {getRecoveryStateDisplay().icon} {getRecoveryStateDisplay().text}
                </div>
              </div>
              
              {errorScenario && (
                <div className={styles.statusCard}>
                  <div className={styles.statusLabel}>Active Scenario</div>
                  <div className={styles.statusValue}>
                    {errorScenario.icon} {errorScenario.name}
                  </div>
                </div>
              )}
              
              {retryCount > 0 && (
                <div className={styles.statusCard}>
                  <div className={styles.statusLabel}>Retry Count</div>
                  <div className={styles.statusValue}>
                    🔄 {retryCount}/3 attempts
                  </div>
                </div>
              )}
              
              <div className={styles.statusCard}>
                <div className={styles.statusLabel}>Error Resilience</div>
                <div className={styles.statusValue}>
                  🛡️ Active
                </div>
              </div>
            </div>
          </div>

          {/* Error Log */}
          <div className={styles.errorLogSection}>
            <h4>Real-Time Error Handling Log</h4>
            <div className={styles.errorLog} data-testid="error-log">
              {errorLog.length === 0 ? (
                <div className={styles.emptyLog}>
                  <span>🔍 Select an error scenario to see live error handling in action</span>
                </div>
              ) : (
                errorLog.map(entry => (
                  <div
                    key={entry.id}
                    className={`${styles.logEntry} ${styles[entry.type]}`}
                    data-testid={`log-entry-${entry.type}`}
                  >
                    <div className={styles.logTimestamp}>{entry.timestamp}</div>
                    <div className={styles.logContent}>
                      <div className={styles.logTitle}>{entry.title}</div>
                      <div className={styles.logMessage}>{entry.message}</div>
                    </div>
                    <div className={styles.logType}>
                      {entry.type === 'error' && '❌'}
                      {entry.type === 'warning' && '⚠️'}
                      {entry.type === 'info' && 'ℹ️'}
                      {entry.type === 'success' && '✅'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fallback Content Simulation */}
          {recoveryState === 'fallback-shown' && (
            <div className={styles.fallbackContent} data-testid="fallback-content">
              <div className={styles.fallbackHeader}>
                <h4>🛡️ Fallback Content Active</h4>
                <span className={styles.fallbackBadge}>Graceful Degradation</span>
              </div>
              <div className={styles.fallbackBody}>
                <div className={styles.fallbackMessage}>
                  <strong>We're experiencing technical difficulties</strong>
                  <p>Don't worry! We've activated fallback content so you can continue your Bible study:</p>
                </div>
                <div className={styles.fallbackOptions}>
                  <div className={styles.fallbackOption}>
                    📖 <strong>Cached Scripture:</strong> Previously loaded verses available offline
                  </div>
                  <div className={styles.fallbackOption}>
                    🔍 <strong>Basic Search:</strong> Search within cached content
                  </div>
                  <div className={styles.fallbackOption}>
                    📚 <strong>Offline Resources:</strong> Downloaded translation helps still accessible
                  </div>
                  <div className={styles.fallbackOption}>
                    ↻ <strong>Auto-Recovery:</strong> System automatically retrying connection
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {recoveryState === 'recovered' && (
            <div className={styles.successContent} data-testid="success-content">
              <div className={styles.successHeader}>
                <h4>✅ Connection Restored!</h4>
                <span className={styles.successBadge}>Fully Operational</span>
              </div>
              <div className={styles.successBody}>
                <p><strong>Great news!</strong> The connection has been successfully restored.</p>
                <div className={styles.successMetrics}>
                  <div className={styles.successMetric}>
                    <span className={styles.metricLabel}>Recovery Time</span>
                    <span className={styles.metricValue}>{retryCount * 2}s</span>
                  </div>
                  <div className={styles.successMetric}>
                    <span className={styles.metricLabel}>Retries Used</span>
                    <span className={styles.metricValue}>{retryCount}/3</span>
                  </div>
                  <div className={styles.successMetric}>
                    <span className={styles.metricLabel}>User Impact</span>
                    <span className={styles.metricValue}>Minimal</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Insights */}
        <div className={styles.technicalInsights}>
          <h4>🔧 Error Handling Strategies</h4>
          <div className={styles.strategiesList}>
            <div className={styles.strategy}>
              <span className={styles.strategyIcon}>🔄</span>
              <span>Exponential backoff with jitter prevents thundering herd</span>
            </div>
            <div className={styles.strategy}>
              <span className={styles.strategyIcon}>🛡️</span>
              <span>Circuit breaker pattern protects downstream services</span>
            </div>
            <div className={styles.strategy}>
              <span className={styles.strategyIcon}>💾</span>
              <span>Intelligent caching provides immediate fallback content</span>
            </div>
            <div className={styles.strategy}>
              <span className={styles.strategyIcon}>📊</span>
              <span>User-friendly error messages with actionable guidance</span>
            </div>
            <div className={styles.strategy}>
              <span className={styles.strategyIcon}>🚀</span>
              <span>Background recovery maintains seamless user experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 