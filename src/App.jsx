import React, { useState, useEffect } from 'react';
import { GitBranch, GitCommit, Activity, Settings, BarChart3, RefreshCw } from 'lucide-react';
import RepoPanel from './components/RepoPanel';
import CommitPanel from './components/CommitPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import ActivityFeed from './components/ActivityFeed';
import SettingsModal from './components/SettingsModal';

const API_BASE = '/api';

function App() {
  const [workspacePath, setWorkspacePath] = useState(localStorage.getItem('workspacePath') || '');
  const [repoData, setRepoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (workspacePath) {
      detectRepo();
      loadAnalytics();
      loadLogs();
    }
    // if (repoData) {
    //   // Fallback to empty string if remoteUrl is null/undefined
    //   setRemoteUrl(repoData.remoteUrl || '');
    //   setSelectedBranch(repoData.currentBranch || '');
    // }
  }, [workspacePath]);

  const detectRepo = async () => {
    if (!workspacePath) return;

    setIsLoading(true);
    addLog('Detecting repository...', 'info');

    try {
      const response = await fetch(`${API_BASE}/repo/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // FIX: Parse as JSON directly to avoid stream consumption issues
      const data = await response.json();

      if (data.isRepo) {
        setRepoData(data);
        addLog(`✓ Repository detected: ${data.repoName}`, 'success');
      } else {
        setRepoData(null);
        addLog('✗ No Git repository found', 'error');
      }
    } catch (error) {
      console.error("Error in detectRepo:", error);
      addLog(`✗ Error: ${error.message}`, 'error');
      setRepoData(null);
    } finally {
      // FIX: Ensure loading is cleared even on network failure
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/logs`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const addLog = (message, type = 'info') => {
    const newLog = {
      // FIX: Unique ID using timestamp + random string
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action: message,
      success: type === 'success' ? 1 : type === 'error' ? 0 : null
    };
    
    // FIX: Use functional update to avoid log-dependency loops
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const handleWorkspaceChange = (path) => {
    setWorkspacePath(path);
    localStorage.setItem('workspacePath', path);
  };

  const refreshData = () => {
    detectRepo();
    loadAnalytics();
    loadLogs();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitBranch className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">RepoSense</h1>
                <p className="text-sm text-gray-400">GitHub Control Center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Workspace Path Input */}
      {!workspacePath && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Set Workspace Path</h2>
            <p className="text-gray-400 mb-4">
              Enter the absolute path to your Git repository folder:
            </p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="/Users/yourname/projects/my-repo"
                className="input-field flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleWorkspaceChange(e.target.value);
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  handleWorkspaceChange(input.value);
                }}
                className="btn-primary"
              >
                Set Path
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Example: /home/user/my-project or C:\Users\User\Documents\my-project
            </p>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      {workspacePath && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>
          </div>

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Repo Info */}
              <div className="lg:col-span-1 space-y-6">
                <RepoPanel
                  workspacePath={workspacePath}
                  repoData={repoData}
                  isLoading={isLoading}
                  onRefresh={detectRepo}
                  onLog={addLog}
                />
              </div>

              {/* Middle Column - Commit Actions */}
              <div className="lg:col-span-1 space-y-6">
                <CommitPanel
                  workspacePath={workspacePath}
                  repoData={repoData}
                  onRefresh={refreshData}
                  onLog={addLog}
                />
              </div>

              {/* Right Column - Activity Feed */}
              <div className="lg:col-span-1">
                <ActivityFeed logs={logs} />
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <AnalyticsPanel analytics={analytics} onRefresh={loadAnalytics} />
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          workspacePath={workspacePath}
          onClose={() => setShowSettings(false)}
          onWorkspaceChange={handleWorkspaceChange}
          onLog={addLog}
        />
      )}
    </div>
  );
}

export default App;