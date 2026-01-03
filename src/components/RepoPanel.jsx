import React, { useState, useEffect } from 'react';
import { GitBranch, Link2, CheckCircle, XCircle, RefreshCw, Loader, Trash2 } from 'lucide-react';

const API_BASE = '/api';

function RepoPanel({ workspacePath, repoData, isLoading, onRefresh, onLog }) {
  const [remoteUrl, setRemoteUrl] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [isCheckingRemote, setIsCheckingRemote] = useState(false);
  const [remoteStatus, setRemoteStatus] = useState(null);
  const [showBranchInput, setShowBranchInput] = useState(false);

  useEffect(() => {
    if (repoData) {
      setRemoteUrl(repoData.remoteUrl);
      setSelectedBranch(repoData.currentBranch);
    }
  }, [repoData]);

  const handleCheckRemote = async () => {
    setIsCheckingRemote(true);
    onLog('Checking remote reachability...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/check-remote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      
      const data = await response.json();
      setRemoteStatus(data.reachable);
      
      if (data.reachable) {
        onLog('✓ Remote is reachable', 'success');
      } else {
        onLog(`✗ Remote unreachable: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error checking remote: ${error.message}`, 'error');
    } finally {
      setIsCheckingRemote(false);
    }
  };

  const handleChangeRemote = async () => {
    if (!remoteUrl.trim()) {
      onLog('✗ Remote URL cannot be empty', 'error');
      return;
    }

    onLog('Updating remote URL...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/set-remote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, url: remoteUrl })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog('✓ Remote URL updated successfully', 'success');
        onRefresh();
      } else {
        onLog(`✗ Failed to update remote: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    }
  };

  const handleSwitchBranch = async () => {
    if (!selectedBranch) return;

    onLog(`Switching to branch: ${selectedBranch}...`, 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, branch: selectedBranch })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog(`✓ Switched to branch: ${selectedBranch}`, 'success');
        onRefresh();
      } else {
        onLog(`✗ Failed to switch branch: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      onLog('✗ Branch name cannot be empty', 'error');
      return;
    }

    onLog(`Creating branch: ${newBranchName}...`, 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/create-branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, branchName: newBranchName })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog(`✓ Branch created: ${newBranchName}`, 'success');
        setNewBranchName('');
        setShowBranchInput(false);
        onRefresh();
      } else {
        onLog(`✗ Failed to create branch: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    }
  };

  const handleDeleteBranch = async (branchName) => {
    // Prevent deleting current branch
    if (branchName === repoData.currentBranch) {
      onLog('✗ Cannot delete the current branch', 'error');
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(`Are you sure you want to delete branch "${branchName}"?`);
    if (!confirmed) return;

    onLog(`Deleting branch: ${branchName}...`, 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/delete-branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, branchName })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog(`✓ Branch deleted: ${branchName}`, 'success');
        onRefresh();
      } else {
        onLog(`✗ Failed to delete branch: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    }
  };

  const handleInitRepo = async () => {
    onLog('Initializing Git repository...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog('✓ Repository initialized', 'success');
        onRefresh();
      } else {
        onLog(`✗ Failed to initialize: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!repoData) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Repository Not Found</h2>
        <p className="text-gray-400 text-sm mb-4">
          No Git repository detected in this workspace.
        </p>
        <button onClick={handleInitRepo} className="btn-primary w-full">
          Initialize Repository
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Repository Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Repository</h2>
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Repository Name</label>
            <div className="text-white font-medium">{repoData.repoName}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Current Branch</label>
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-primary-500" />
              <span className="text-white font-medium">{repoData.currentBranch}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Remote URL */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-3">Remote Repository</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Remote URL (origin)</label>
            <input
              type="text"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://github.com/user/repo.git"
              className="input-field w-full text-sm"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleChangeRemote}
              className="btn-primary flex-1 text-sm"
            >
              Update URL
            </button>
            
            <button
              onClick={handleCheckRemote}
              disabled={isCheckingRemote}
              className="btn-secondary text-sm flex items-center space-x-1"
            >
              {isCheckingRemote ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : remoteStatus === true ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : remoteStatus === false ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              <span>Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Branch Management */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-3">Branch Management</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Switch Branch</label>
            <div className="flex space-x-2">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="input-field flex-1 text-sm"
              >
                {repoData.branches.map(branch => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleSwitchBranch}
                disabled={selectedBranch === repoData.currentBranch}
                className="btn-primary text-sm"
              >
                Switch
              </button>
            </div>
          </div>

          {!showBranchInput ? (
            <button
              onClick={() => setShowBranchInput(true)}
              className="btn-secondary w-full text-sm"
            >
              Create New Branch
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="feature/new-branch"
                className="input-field w-full text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBranch();
                  if (e.key === 'Escape') {
                    setShowBranchInput(false);
                    setNewBranchName('');
                  }
                }}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateBranch}
                  className="btn-primary flex-1 text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowBranchInput(false);
                    setNewBranchName('');
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Delete Branch */}
          <div className="pt-3 border-t border-gray-700">
            <label className="text-xs text-gray-400 block mb-2">Delete Branch</label>
            <div className="flex space-x-2">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="input-field flex-1 text-sm"
              >
                {repoData.branches.filter(b => b !== repoData.currentBranch).map(branch => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => handleDeleteBranch(selectedBranch)}
                disabled={selectedBranch === repoData.currentBranch || repoData.branches.length <= 1}
                className="btn-secondary text-sm flex items-center space-x-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cannot delete current branch ({repoData.currentBranch})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RepoPanel;