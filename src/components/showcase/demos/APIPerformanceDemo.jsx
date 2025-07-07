/**
 * APIPerformanceDemo.jsx
 * Interactive demonstration of API performance optimization
 * Shows before/after comparison of the 90% optimization achievement
 */

import React, { useState, useEffect } from 'react';
import styles from './APIPerformanceDemo.module.css';

export function APIPerformanceDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [results, setResults] = useState({
    before: null,
    after: null
  });
  const [progress, setProgress] = useState(0);

  // Simulate API call timings
  const simulateAPICall = async (type, onProgress) => {
    const timings = {
      before: {
        steps: [
          { name: 'Fetch manifest', duration: 800, color: '#ef4444' },
          { name: 'Parse manifest', duration: 600, color: '#f97316' },
          { name: 'Find book data', duration: 400, color: '#eab308' },
          { name: 'Load chapter file', duration: 1200, color: '#ef4444' }
        ],
        total: 3000
      },
      after: {
        steps: [
          { name: 'Direct API call', duration: 300, color: '#10b981' }
        ],
        total: 300
      }
    };

    const testData = timings[type];
    let elapsed = 0;

    for (const step of testData.steps) {
      await new Promise(resolve => {
        const startTime = Date.now();
        const interval = setInterval(() => {
          const currentTime = Date.now();
          const stepElapsed = currentTime - startTime;
          const totalElapsed = elapsed + stepElapsed;
          
          onProgress({
            currentStep: step.name,
            stepProgress: Math.min(stepElapsed / step.duration, 1),
            totalProgress: Math.min(totalElapsed / testData.total, 1),
            totalTime: totalElapsed
          });

          if (stepElapsed >= step.duration) {
            clearInterval(interval);
            elapsed += step.duration;
            resolve();
          }
        }, 16);
      });
    }

    return {
      type,
      steps: testData.steps,
      totalTime: testData.total,
      improvement: type === 'after' ? '90%' : null
    };
  };

  const runPerformanceTest = async (type) => {
    setIsRunning(true);
    setCurrentTest(type);
    setProgress(0);

    const result = await simulateAPICall(type, (progressData) => {
      setProgress(progressData);
    });

    setResults(prev => ({
      ...prev,
      [type]: result
    }));

    setIsRunning(false);
    setCurrentTest(null);
    setProgress(0);
  };

  const runBothTests = async () => {
    await runPerformanceTest('before');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await runPerformanceTest('after');
  };

  const resetTests = () => {
    setResults({ before: null, after: null });
    setProgress(0);
    setCurrentTest(null);
    setIsRunning(false);
  };

  const formatTime = (ms) => {
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  };

  return (
    <div className={styles.demoContainer} data-testid="api-performance-demo">
      <div className={styles.demoPanel}>
        <h3 className={styles.demoTitle}>Live API Performance Demo</h3>
        
        <div className={styles.performanceContainer}>
          {/* Test Controls */}
          <div className={styles.testControls}>
            <button
              className={`${styles.testButton} ${styles.beforeButton}`}
              onClick={() => runPerformanceTest('before')}
              disabled={isRunning}
              data-testid="test-before-button"
            >
              Test "Before" (Legacy)
            </button>
            
            <button
              className={`${styles.testButton} ${styles.afterButton}`}
              onClick={() => runPerformanceTest('after')}
              disabled={isRunning}
              data-testid="test-after-button"
            >
              Test "After" (Optimized)
            </button>
            
            <button
              className={`${styles.testButton} ${styles.compareButton}`}
              onClick={runBothTests}
              disabled={isRunning}
              data-testid="compare-button"
            >
              🏁 Compare Both
            </button>
            
            <button
              className={styles.resetButton}
              onClick={resetTests}
              disabled={isRunning}
              data-testid="reset-button"
            >
              Reset
            </button>
          </div>

          {/* Progress Indicator */}
          {isRunning && (
            <div className={styles.progressSection} data-testid="progress-section">
              <div className={styles.progressHeader}>
                <h4>Running {currentTest === 'before' ? 'Legacy' : 'Optimized'} API Test...</h4>
                <span className={styles.progressTime}>
                  {formatTime(progress.totalTime || 0)}
                </span>
              </div>
              
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${(progress.totalProgress || 0) * 100}%` }}
                ></div>
              </div>
              
              <div className={styles.currentStep}>
                Current: {progress.currentStep}
              </div>
            </div>
          )}

          {/* Results Comparison */}
          <div className={styles.resultsGrid}>
            {/* Before Results */}
            <div className={`${styles.resultCard} ${styles.beforeCard} ${results.before ? styles.hasResult : ''}`}>
              <div className={styles.resultHeader}>
                <h4>🐌 Before (Legacy)</h4>
                {results.before && (
                  <span className={styles.resultTime}>
                    {formatTime(results.before.totalTime)}
                  </span>
                )}
              </div>
              
              {results.before ? (
                <div className={styles.resultContent}>
                  <div className={styles.stepsList}>
                    {results.before.steps.map((step, index) => (
                      <div key={index} className={styles.stepItem}>
                        <div 
                          className={styles.stepIndicator}
                          style={{ backgroundColor: step.color }}
                        ></div>
                        <span className={styles.stepName}>{step.name}</span>
                        <span className={styles.stepTime}>{formatTime(step.duration)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.resultSummary}>
                    <strong>Total: {formatTime(results.before.totalTime)}</strong>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyResult}>
                  <span>Run test to see results</span>
                </div>
              )}
            </div>

            {/* After Results */}
            <div className={`${styles.resultCard} ${styles.afterCard} ${results.after ? styles.hasResult : ''}`}>
              <div className={styles.resultHeader}>
                <h4>⚡ After (Optimized)</h4>
                {results.after && (
                  <span className={styles.resultTime}>
                    {formatTime(results.after.totalTime)}
                  </span>
                )}
              </div>
              
              {results.after ? (
                <div className={styles.resultContent}>
                  <div className={styles.stepsList}>
                    {results.after.steps.map((step, index) => (
                      <div key={index} className={styles.stepItem}>
                        <div 
                          className={styles.stepIndicator}
                          style={{ backgroundColor: step.color }}
                        ></div>
                        <span className={styles.stepName}>{step.name}</span>
                        <span className={styles.stepTime}>{formatTime(step.duration)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.resultSummary}>
                    <strong>Total: {formatTime(results.after.totalTime)}</strong>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyResult}>
                  <span>Run test to see results</span>
                </div>
              )}
            </div>
          </div>

          {/* Performance Improvement */}
          {results.before && results.after && (
            <div className={styles.improvementSection} data-testid="improvement-section">
              <div className={styles.improvementCard}>
                <div className={styles.improvementIcon}>🚀</div>
                <div className={styles.improvementStats}>
                  <div className={styles.improvementTitle}>Performance Improvement</div>
                  <div className={styles.improvementValue}>
                    {Math.round(((results.before.totalTime - results.after.totalTime) / results.before.totalTime) * 100)}%
                  </div>
                  <div className={styles.improvementDetails}>
                    From {formatTime(results.before.totalTime)} to {formatTime(results.after.totalTime)}
                  </div>
                </div>
              </div>
              
              <div className={styles.keyMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Time Saved</span>
                  <span className={styles.metricValue}>
                    {formatTime(results.before.totalTime - results.after.totalTime)}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>API Calls</span>
                  <span className={styles.metricValue}>
                    {results.before.steps.length} → {results.after.steps.length}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>User Experience</span>
                  <span className={styles.metricValue}>⭐⭐⭐⭐⭐</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Insights */}
        <div className={styles.technicalInsights}>
          <h4>🔧 Technical Optimizations</h4>
          <div className={styles.optimizationsList}>
            <div className={styles.optimization}>
              <span className={styles.optimizationIcon}>🎯</span>
              <span>Direct API calls eliminate manifest parsing</span>
            </div>
            <div className={styles.optimization}>
              <span className={styles.optimizationIcon}>⚡</span>
              <span>Single request vs. multiple sequential calls</span>
            </div>
            <div className={styles.optimization}>
              <span className={styles.optimizationIcon}>🧠</span>
              <span>Intelligent caching for repeated requests</span>
            </div>
            <div className={styles.optimization}>
              <span className={styles.optimizationIcon}>📊</span>
              <span>Reduced bandwidth and server load</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 