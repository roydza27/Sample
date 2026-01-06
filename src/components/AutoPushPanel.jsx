import React, { useState, useEffect } from 'react';
import { Clock, Play, XCircle, History, Zap, Timer, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = '/api';

function AutoPushPanel({ workspacePath, repoData, onLog }) {
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [activeJobs, setActiveJobs] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (workspacePath && repoData) {
      loadActiveJobs();
      loadHistory();
      loadStats();
      
      // Refresh active jobs every 5 seconds
      const interval = setInterval(() => {
        loadActiveJobs();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [workspacePath, repoData]);

  const loadActiveJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/repo/auto-push/active`);
      const data = await response.json();
      if (data.success) {
        setActiveJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to load active jobs:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/repo/auto-push/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, limit: 10 })
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/repo/auto-push/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } 
  };

  const handleScheduleAutoPush = async () => {
    if (!workspacePath || !repoData) {
      onLog('✗ Repository not detected', 'error');
      return;
    }

    setIsScheduling(true);
    onLog(`Scheduling auto-push for ${delayMinutes} minutes...`, 'info');

    try {
      const response = await fetch(`${API_BASE}/repo/auto-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workspacePath, 
          delayMinutes: parseInt(delayMinutes) 
        })
      });

      const data = await response.json();

      if (data.success) {
        onLog(`✓ Auto-push scheduled for ${delayMinutes} minutes from now`, 'success');
        loadActiveJobs();
        loadStats();
      } else {
        onLog(`✗ Failed to schedule: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setIsScheduling(false);
    }
  };

const handleStartAutoPushLoop = async () => {
  if (!workspacePath || !repoData) {
    onLog('✗ Repository not detected', 'error');
    return;
  }

  setIsScheduling(true);
  onLog('Starting auto-push loop (every 10 minutes)...', 'info');

  try {
    const response = await fetch(`${API_BASE}/repo/auto-loop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspacePath, intervalMinutes: 10 })
    });

    const data = await response.json();

    if (data.success) {
      onLog('Auto-push loop started successfully', 'success');
    } else {
      onLog(`Auto-push loop failed to start: ${data.error}`, 'error');
    }
  } catch (error) {
    onLog(`Auto-push loop error: ${error.message}`, 'error');
  } finally {
    setIsScheduling(false);
  }
};


  const handleCancelJob = async (jobId) => {
    onLog(`Cancelling auto-push job...`, 'info');

    try {
      const response = await fetch(`${API_BASE}/repo/auto-push/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      const data = await response.json();

      if (data.success) {
        onLog('✓ Auto-push cancelled', 'success');
        loadActiveJobs();
        loadHistory();
        loadStats();
      } else {
        onLog(`✗ Failed to cancel: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!repoData) {
    return (
      <div className="card">
        <p className="text-gray-400 text-sm">
          Initialize or detect a repository first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Schedule Auto-Push */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Auto-Push Scheduler</span>
          </h2>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-300 mb-1">
            <strong>What it does:</strong>
          </p>
          <p className="text-xs text-blue-400">
            Automatically stages, commits, and pushes all changes after the specified delay. 
            Perfect for saving work without manual Git commands.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              <Timer className="w-4 h-4 inline mr-1" />
              Delay Time (minutes)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="120"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="input-field flex-1"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 10 minutes • Max: 120 minutes
            </p>
            <button
            onClick={handleStartAutoPushLoop}
            disabled={isScheduling}
            className="btn-primary w-full flex items-center justify-center space-x-2"
            >
            <Zap className="w-4 h-4" />
            <span>Start Auto-Push Loop</span>
            </button>

          </div>

          <button
            onClick={handleScheduleAutoPush}
            disabled={isScheduling || !delayMinutes || delayMinutes < 1}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isScheduling ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Schedule Auto-Push</span>
              </>
            )}
          </button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Files will be staged with: <code className="text-gray-400">git add .</code></p>
            <p>• Commit message: <code className="text-gray-400">Auto push at [timestamp]</code></p>
            <p>• Push to: <code className="text-gray-400">origin/{repoData.currentBranch}</code></p>
          </div>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary-500" />
            <span>Active Jobs ({activeJobs.length})</span>
          </h3>

          <div className="space-y-2">
            {activeJobs.map((job) => (
              <div
                key={job.jobId}
                className="bg-gray-900 border border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span className="text-sm font-medium text-white">Scheduled</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Executes at: {formatDateTime(job.executeAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelJob(job.jobId)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-gray-800 rounded px-2 py-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Time remaining:</span>
                    <span className="text-xs font-mono text-primary-400">
                      {formatTime(job.timeRemaining)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Auto-Push Statistics</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Total Jobs</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Active</div>
              <div className="text-2xl font-bold text-blue-500">{stats.active}</div>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            </div>
          </div>
        </div>
      )}

      {/* History Toggle */}
      <div className="card">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <History className="w-4 h-4 text-primary-500" />
            <span>History</span>
          </h3>
          <span className="text-xs text-gray-400">
            {showHistory ? 'Hide' : 'Show'}
          </span>
        </button>

        {showHistory && history.length > 0 && (
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {history.map((job) => (
              <div
                key={job.id}
                className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    <span className="text-gray-300 capitalize">{job.status}</span>
                  </div>
                  <span className="text-gray-500">
                    {formatDateTime(job.scheduled_at)}
                  </span>
                </div>
                {job.error && (
                  <p className="text-red-400 text-xs mt-1">
                    Error: {job.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {showHistory && history.length === 0 && (
          <p className="text-xs text-gray-500 mt-3">No history yet</p>
        )}
      </div>
    </div>
  );
}

export default AutoPushPanel;