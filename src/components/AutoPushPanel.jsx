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

  const addLog = (msg, type='info') => {
    onLog(msg, type);
  };

  const handleStartAutoLoop = async () => {
    if (!workspacePath || !repoData) {
      addLog('✗ Repository not detected', 'error');
      return;
    }

    addLog(`Starting auto-push loop (every ${delayMinutes} minutes)...`, 'info');

    try {
      const response = await fetch(`${API_BASE}/repo/auto-loop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, intervalMinutes: delayMinutes })
      });

      const data = await response.json();

      if (data.success) {
        addLog('Auto-push loop started successfully', 'success');
      } else {
        addLog(`Auto-push loop failed to start: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`Auto-push loop error: ${error.message}`, 'error');
    }
  };

  const handleCancelJob = async (jobId) => {
    addLog('Cancelling auto-push job...', 'info');

    try {
      const response = await fetch(`${API_BASE}/repo/auto-push/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      const data = await response.json();

      if (data.success) {
        addLog('Auto-push cancelled successfully', 'success');
        loadActiveJobs();
        loadHistory();
        loadStats();
      } else {
        addLog(`Failed to cancel: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`Cancel job error: ${error.message}`, 'error');
    }
  };

  const formatTime = (seconds) => {
    seconds = Number(seconds) || 0;
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds/60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return isNaN(d) ? "Invalid Date" : d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (status === 'cancelled') return <XCircle className="w-4 h-4 text-gray-500" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  if (!repoData) {
    return <div className="card"><p className="text-gray-400 text-sm">Initialize or detect a repository first.</p></div>;
  }

  return (
    <div className="space-y-4">

      <div className="card">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span>Auto-Push Scheduler</span>
        </h2>

        <div className="mt-4">
          <label className="text-sm text-gray-400 block mb-2">
            <Timer className="w-4 h-4 inline mr-1" />
            Delay Time (minutes)
          </label>

          <input
            type="number"
            min="1"
            max="120"
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(Number(e.target.value))}
            className="input-field w-full"
          />
        </div>

        <button onClick={handleStartAutoLoop} className="btn-primary w-full mt-4">
          Start Auto Push Loop
        </button>
      </div>

      {stats && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Auto-Push Statistics</h3>
          <p className="text-xs text-gray-400">Total Jobs: {stats.total}</p>
          <p className="text-xs text-green-400">Completed: {stats.completed}</p>
          <p className="text-xs text-blue-400">Active: {stats.active}</p>
          <p className="text-xs text-red-400">Failed: {stats.failed}</p>
        </div>
      )}

      {activeJobs.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Active Jobs ({activeJobs.length})</h3>

          {activeJobs.map(job => {
            const runTime = job.execute_at ? new Date(job.execute_at) : null;
            const runTimeText = runTime && !isNaN(runTime) ? formatDateTime(job.execute_at) : "Invalid Date";

            return (
              <div key={job.jobId} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs mt-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    <span>{job.status}</span>
                  </span>
                  <button onClick={() => handleCancelJob(job.jobId)}>
                    <XCircle className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <p className="text-gray-500">Runs at: {runTimeText}</p>
                <p className="text-primary-400">Time Remaining: {formatTime(job.timeRemaining)}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <button onClick={() => setShowHistory(!showHistory)} className="w-full text-left text-xs text-gray-400">
          {showHistory ? 'Hide History' : 'Show History'}
        </button>

        {showHistory && history.map(job => (
          <div key={job.id} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs mt-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                {getStatusIcon(job.status)}
                <span>{job.status}</span>
              </span>
              <span className="text-gray-500">{formatDateTime(job.scheduled_at)}</span>
            </div>
            {job.error && <p className="text-red-400">Error: {job.error}</p>}
          </div>
        ))}
      </div>

    </div>
  );
}

export default AutoPushPanel;
