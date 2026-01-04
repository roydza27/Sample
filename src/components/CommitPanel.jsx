import React, { useState, useEffect } from 'react';
import { GitCommit, Upload, Sparkles, FileText, Loader, Download, RefreshCw, AlertTriangle, Shield, Zap } from 'lucide-react';

const API_BASE = '/api';

function CommitPanel({ workspacePath, repoData, onRefresh, onLog }) {
  const [commitMessage, setCommitMessage] = useState('');
  const [autoPush, setAutoPush] = useState(true);
  const [forcePush, setForcePush] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState(null);
  const [diff, setDiff] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [pullNeeded, setPullNeeded] = useState(false);
  const [showConflictResolver, setShowConflictResolver] = useState(false);

  useEffect(() => {
    if (workspacePath && repoData) {
      loadStatus();
      loadDiff();
    }
  }, [workspacePath, repoData]);

  const loadStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/repo/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const loadDiff = async () => {
    try {
      const response = await fetch(`${API_BASE}/repo/diff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      
      const data = await response.json();
      setDiff(data);
    } catch (error) {
      console.error('Failed to load diff:', error);
    }
  };

  const handleSuggestCommit = async () => {
    onLog('Generating commit message suggestion...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/ai/suggest-commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      
      const data = await response.json();
      setSuggestion(data.suggestion);
      setCommitMessage(data.suggestion);
      onLog('✓ Suggestion generated', 'success');
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    }
  };

  const handleCommitPush = async () => {
    if (!commitMessage.trim()) {
      onLog('✗ Commit message is required', 'error');
      return;
    }

    setIsCommitting(true);
    setPullNeeded(false);
    onLog('Committing changes...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/commit-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspacePath,
          message: commitMessage,
          autoPush,
          forcePush
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.committed) {
          onLog(`✓ Committed: ${data.filesChanged} files changed`, 'success');
          
          if (autoPush) {
            if (data.pushed) {
              if (data.forcePushed) {
                onLog('✓ Force pushed to remote successfully', 'success');
              } else {
                onLog('✓ Pushed to remote successfully', 'success');
              }
              setPullNeeded(false);
            } else {
              if (data.pullNeeded) {
                onLog('⚠ Push rejected: Remote has newer commits. Pull first or use Force Push', 'error');
                setPullNeeded(true);
              } else {
                onLog(`✗ Push failed: ${data.pushError}`, 'error');
              }
            }
          }
          
          setCommitMessage('');
          setSuggestion('');
          setForcePush(false);
          onRefresh();
          loadStatus();
          loadDiff();
        } else {
          onLog(data.message, 'info');
        }
      } else {
        onLog(`✗ Commit failed: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePushOnly = async () => {
    setIsPushing(true);
    setPullNeeded(false);
    onLog(forcePush ? 'Force pushing to remote...' : 'Pushing to remote...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, forcePush })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog(data.message, 'success');
        setPullNeeded(false);
        setForcePush(false);
      } else {
        if (data.needsPull) {
          onLog('⚠ Push rejected: Remote has newer commits. Pull first or use Force Push', 'error');
          setPullNeeded(true);
        } else {
          onLog(`✗ Push failed: ${data.friendlyError || data.error}`, 'error');
        }
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setIsPushing(false);
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    onLog('Pulling from remote...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, rebase: false })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog('✓ Pulled successfully', 'success');
        setPullNeeded(false);
        onRefresh();
        loadStatus();
        loadDiff();
      } else {
        onLog(`✗ Pull failed: ${data.friendlyError || data.error}`, 'error');
        if (data.error && data.error.includes('conflict')) {
          setShowConflictResolver(true);
        }
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    onLog('Syncing with remote (pull + push)...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, forcePush })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog('✓ Synced successfully', 'success');
        setPullNeeded(false);
        setForcePush(false);
        onRefresh();
        loadStatus();
        loadDiff();
      } else {
        if (data.hasConflicts) {
          onLog('✗ Merge conflicts detected. Use conflict resolver', 'error');
          setShowConflictResolver(true);
        } else {
          onLog(`✗ Sync failed: ${data.error}`, 'error');
        }
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResolveConflicts = async (strategy) => {
    onLog(`Resolving conflicts with ${strategy} version...`, 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/resolve-conflicts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath, strategy })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog(`✓ Conflicts resolved using ${strategy} version`, 'success');
        setShowConflictResolver(false);
        onRefresh();
        loadStatus();
        loadDiff();
      } else {
        onLog(`✗ Failed to resolve conflicts: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
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

  const hasChanges = status?.files && status.files.length > 0;

  return (
    <div className="space-y-4">
      {/* Commit Changes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Commit Changes</h2>
          <GitCommit className="w-5 h-5 text-primary-500" />
        </div>

        {/* Diff Summary */}
        {diff && (
          <div className="bg-gray-900 rounded-lg p-3 mb-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Changes Preview</div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="text-gray-300">
                <FileText className="w-3 h-3 inline mr-1" />
                {diff.filesChanged} files
              </span>
              <span className="text-green-400">+{diff.linesAdded}</span>
              <span className="text-red-400">-{diff.linesRemoved}</span>
            </div>
            {diff.summary && (
              <div className="text-xs text-gray-500 mt-2">{diff.summary}</div>
            )}
          </div>
        )}

        {/* Changed Files */}
        {status?.files && status.files.length > 0 && (
          <div className="mb-4 max-h-32 overflow-y-auto">
            <div className="text-xs text-gray-400 mb-2">Modified Files</div>
            <div className="space-y-1">
              {status.files.map((file, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-300 flex items-center space-x-2 bg-gray-900 rounded px-2 py-1"
                >
                  <span className={`font-mono ${
                    file.status.includes('M') ? 'text-yellow-500' :
                    file.status.includes('A') || file.status.includes('??') ? 'text-green-500' :
                    file.status.includes('D') ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {file.status}
                  </span>
                  <span className="truncate">{file.filepath}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasChanges && (
          <div className="bg-gray-900 rounded-lg p-3 mb-4 border border-gray-700">
            <p className="text-sm text-gray-400">No changes to commit</p>
          </div>
        )}

        {/* Commit Message */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Commit Message</label>
              <button
                onClick={handleSuggestCommit}
                disabled={!hasChanges}
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Suggest</span>
              </button>
            </div>
            
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Update components and fix styling"
              className="input-field w-full"
              disabled={!hasChanges}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleCommitPush();
                }
              }}
            />
            
            {suggestion && suggestion !== commitMessage && (
              <div className="text-xs text-gray-500 mt-1">
                Suggestion: {suggestion}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoPush"
                checked={autoPush}
                onChange={(e) => setAutoPush(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="autoPush" className="text-sm text-gray-400">
                Auto-push after commit
              </label>
            </div>

            {autoPush && (
              <div className="flex items-center space-x-2 ml-6">
                <input
                  type="checkbox"
                  id="forcePush"
                  checked={forcePush}
                  onChange={(e) => setForcePush(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                />
                <label htmlFor="forcePush" className="text-sm text-gray-400 flex items-center space-x-1">
                  <span>Force push</span>
                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                </label>
              </div>
            )}

            {forcePush && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-2 ml-6">
                <p className="text-xs text-yellow-400 flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Force push will overwrite remote history. Use with caution!</span>
                </p>
              </div>
            )}

            {pullNeeded && (
              <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-2">
                <p className="text-xs text-orange-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Remote has newer commits. Pull first or enable Force Push</span>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleCommitPush}
            disabled={!hasChanges || !commitMessage.trim() || isCommitting}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isCommitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Committing...</span>
              </>
            ) : (
              <>
                <GitCommit className="w-4 h-4" />
                <span>Commit{autoPush ? ' & Push' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Operations */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-3">Sync Operations</h3>
        
        <div className="space-y-2">
          {/* Pull Button */}
          <button
            onClick={handlePull}
            disabled={isPulling}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            {isPulling ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Pulling...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Pull from Remote</span>
              </>
            )}
          </button>

          {/* Push Button */}
          <button
            onClick={handlePushOnly}
            disabled={isPushing}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            {isPushing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Pushing...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{forcePush ? 'Force Push' : 'Push to Remote'}</span>
              </>
            )}
          </button>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isSyncing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Sync (Pull + Push)</span>
              </>
            )}
          </button>

          {/* Force Push Toggle for Sync Operations */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-700">
            <input
              type="checkbox"
              id="forcePushSync"
              checked={forcePush}
              onChange={(e) => setForcePush(e.target.checked)}
              className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
            />
            <label htmlFor="forcePushSync" className="text-xs text-gray-400 flex items-center space-x-1">
              <span>Enable Force Push</span>
              {forcePush && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
            </label>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Pull: Get latest changes • Push: Send your commits • Sync: Do both
        </p>
      </div>

      {/* Conflict Resolver */}
      {showConflictResolver && (
        <div className="card bg-red-900/20 border-red-700">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-semibold text-white">Merge Conflicts Detected</h3>
          </div>
          
          <p className="text-xs text-gray-400 mb-3">
            Choose how to resolve conflicts:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleResolveConflicts('ours')}
              className="btn-secondary w-full text-sm flex items-center justify-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Keep My Changes (Ours)</span>
            </button>

            <button
              onClick={() => handleResolveConflicts('theirs')}
              className="btn-secondary w-full text-sm flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Use Remote Changes (Theirs)</span>
            </button>

            <button
              onClick={() => setShowConflictResolver(false)}
              className="btn-secondary w-full text-sm text-gray-400"
            >
              Cancel (Resolve Manually)
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Or resolve conflicts manually in your editor and commit again
          </p>
        </div>
      )}
    </div>
  );
}

export default CommitPanel;