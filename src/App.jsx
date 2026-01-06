import React, { useState, useEffect } from 'react';
import { GitBranch, GitCommit, Activity, Settings, BarChart3, RefreshCw, Zap } from 'lucide-react';
import RepoPanel from './components/RepoPanel';
import CommitPanel from './components/CommitPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import ActivityFeed from './components/ActivityFeed';
import SettingsModal from './components/SettingsModal';
import AutoPushPanel from './components/AutoPushPanel';

const API_BASE = '/api';

function App() {
  const [workspacePath, setWorkspacePath] = useState(localStorage.getItem('workspacePath') || '');
  const [repoData, setRepoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [autoPushStats, setAutoPushStats] = useState(null);
  const [autoPushHistory, setAutoPushHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (workspacePath) {
      detectRepo();
      loadAnalytics();
      loadLogs();
      loadAutoPushStats();
      loadAutoPushHistory();
    }
  }, [workspacePath]);

  // Auto push every 10 minutes
  useEffect(() => {
    if (!workspacePath) return;

    const intervalId = setInterval(async () => {
      try {
        // 1. Ask AI for commit message
        const aiRes = await fetch(`${API_BASE}/ai/suggest-commit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspacePath: workspacePath })
        });
        const aiData = await aiRes.json();
        const aiMessage = aiData.suggestion || "Auto update";

        // 2. Push using AI message
        const gitRes = await fetch(`${API_BASE}/repo/commit-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspacePath: workspacePath, message: aiMessage, autoPush: true })
        });

        const gitData = await gitRes.json();
        addLog(gitData.success ? `Auto push successful: ${aiMessage}` : 'Auto push failed', gitData.success ? 'success' : 'error');

      } catch (err) {
        addLog(`Auto push error: ${err.message}`, 'error');
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [workspacePath]);


  const detectRepo = async () => {
    if (!workspacePath) return;
    setIsLoading(true);
    addLog('Detecting repository...', 'info');

    try {
      const res = await fetch(`${API_BASE}/repo/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      const data = await res.json();
      if (data.isRepo) {
        setRepoData(data);
        addLog(`✓ Repository detected: ${data.repoName}`, 'success');
      } else {
        setRepoData(null);
        addLog('✗ No Git repository found', 'error');
      }
    } catch (err) {
      addLog(`✗ Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      setAnalytics(await res.json());
    } catch {}
  };

  const loadLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      setLogs((await res.json()).logs || []);
    } catch {}
  };

  const loadAutoPushStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/repo/auto-push/stats`);
      setAutoPushStats(await res.json());
    } catch {}
  };

  const loadAutoPushHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/repo/auto-push/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      const data = await res.json();
      setAutoPushHistory(data.jobs || []);
    } catch {}
  };

  const addLog = (msg, type='info') => {
    setLogs(prev => [{ id: Date.now(), timestamp: new Date().toISOString(), action: msg, success: type==='success'?1:type==='error'?0:null }, ...prev.slice(0,49)]);
  };

  const handleWorkspaceChange = (p) => {
    setWorkspacePath(p);
    localStorage.setItem('workspacePath', p);
  };

  const refreshData = () => {
    detectRepo();
    loadAnalytics();
    loadLogs();
    loadAutoPushStats();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GitBranch className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">RepoSense</h1>
              <p className="text-sm text-gray-400">GitHub Control Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={refreshData} className="p-2 hover:bg-gray-700 rounded-lg"><RefreshCw className="w-5 h-5 text-gray-400"/></button>
            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-700 rounded-lg"><Settings className="w-5 h-5 text-gray-400"/></button>
          </div>
        </div>
      </header>

      {!workspacePath && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* unchanged */}
        </div>
      )}

      {workspacePath && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab==='dashboard'?'bg-primary-600 text-white':'text-gray-400 hover:bg-gray-700'}`}>
              <div className="flex items-center justify-center space-x-2"><Activity className="w-4 h-4" /><span>Dashboard</span></div>
            </button>
            <button onClick={() => setActiveTab('autopush')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab==='autopush'?'bg-primary-600 text-white':'text-gray-400 hover:bg-gray-700'}`}>
              <div className="flex items-center justify-center space-x-2"><Zap className="w-4 h-4" /><span>Auto-Push</span></div>
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab==='analytics'?'bg-primary-600 text-white':'text-gray-400 hover:bg-gray-700'}`}>
              <div className="flex items-center justify-center space-x-2"><BarChart3 className="w-4 h-4" /><span>Analytics</span></div>
            </button>
          </div>

          {activeTab==='dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1"><RepoPanel workspacePath={workspacePath} repoData={repoData} isLoading={isLoading} onRefresh={detectRepo} onLog={addLog} /></div>
              <div className="lg:col-span-1"><CommitPanel workspacePath={workspacePath} repoData={repoData} onRefresh={refreshData} onLog={addLog} /></div>
              <div className="lg:col-span-1"><ActivityFeed logs={logs} /></div>
            </div>
          )}

          {activeTab==='analytics' && <AnalyticsPanel analytics={analytics} onRefresh={loadAnalytics} />}

          {activeTab==='autopush' && (
            <AutoPushPanel workspacePath={workspacePath} repoData={repoData} stats={autoPushStats} history={autoPushHistory} onLog={addLog} onRefresh={loadAutoPushStats} />
          )}
        </div>
      )}

      {showSettings && <SettingsModal workspacePath={workspacePath} onClose={() => setShowSettings(false)} onWorkspaceChange={handleWorkspaceChange} onLog={addLog} />}
    </div>
  );
}

export default App;
