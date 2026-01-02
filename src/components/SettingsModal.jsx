import React, { useState, useEffect } from 'react';
import { X, User, Mail, Folder, Save } from 'lucide-react';

const API_BASE = '/api';

function SettingsModal({ workspacePath, onClose, onWorkspaceChange, onLog }) {
  const [gitName, setGitName] = useState('');
  const [gitEmail, setGitEmail] = useState('');
  const [newWorkspacePath, setNewWorkspacePath] = useState(workspacePath);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadIdentity();
  }, [workspacePath]);

  const loadIdentity = async () => {
    if (!workspacePath) return;
    
    try {
      const response = await fetch(`${API_BASE}/repo/get-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspacePath })
      });
      
      const data = await response.json();
      setGitName(data.name || '');
      setGitEmail(data.email || '');
    } catch (error) {
      console.error('Failed to load identity:', error);
    }
  };

  const handleSaveIdentity = async () => {
    if (!gitName.trim() || !gitEmail.trim()) {
      onLog('✗ Name and email are required', 'error');
      return;
    }

    setIsSaving(true);
    onLog('Saving Git identity...', 'info');
    
    try {
      const response = await fetch(`${API_BASE}/repo/set-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspacePath,
          name: gitName,
          email: gitEmail
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLog('✓ Git identity saved', 'success');
      } else {
        onLog(`✗ Failed to save identity: ${data.error}`, 'error');
      }
    } catch (error) {
      onLog(`✗ Error: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeWorkspace = () => {
    if (!newWorkspacePath.trim()) {
      onLog('✗ Workspace path cannot be empty', 'error');
      return;
    }
    
    onWorkspaceChange(newWorkspacePath);
    onLog('✓ Workspace path updated', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Workspace Path */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Workspace</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  <Folder className="w-4 h-4 inline mr-1" />
                  Repository Path
                </label>
                <input
                  type="text"
                  value={newWorkspacePath}
                  onChange={(e) => setNewWorkspacePath(e.target.value)}
                  placeholder="/path/to/your/repo"
                  className="input-field w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Absolute path to your Git repository folder
                </p>
              </div>

              <button
                onClick={handleChangeWorkspace}
                className="btn-primary"
              >
                Change Workspace
              </button>
            </div>
          </div>

          {/* Git Identity */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Git Identity</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Name
                </label>
                <input
                  type="text"
                  value={gitName}
                  onChange={(e) => setGitName(e.target.value)}
                  placeholder="Your Name"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={gitEmail}
                  onChange={(e) => setGitEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="input-field w-full"
                />
              </div>

              <button
                onClick={handleSaveIdentity}
                disabled={isSaving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Identity'}</span>
              </button>

              <p className="text-xs text-gray-500">
                This identity will be used for all commits in this repository
              </p>
            </div>
          </div>

          {/* About */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-2">About RepoSense</h3>
            <p className="text-sm text-gray-400 mb-2">
              Version 1.0.0
            </p>
            <p className="text-xs text-gray-500">
              AI-powered GitHub control center with automation and analytics.
              Built for developers who want effortless Git workflow.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;