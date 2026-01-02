import React from 'react';
import { 
  TrendingUp, 
  FileText, 
  GitCommit, 
  Zap, 
  Target, 
  Clock,
  Flame,
  CheckCircle,
  BarChart3
} from 'lucide-react';

function AnalyticsPanel({ analytics, onRefresh }) {
  if (!analytics) {
    return (
      <div className="card">
        <p className="text-gray-400 text-sm">Loading analytics...</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const metrics = [
    {
      icon: GitCommit,
      label: 'Total Commits',
      value: analytics.totalCommits,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Clock,
      label: 'Time Saved',
      value: formatTime(analytics.timeSavedSeconds),
      subtitle: 'CLI automation',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Flame,
      label: 'Commit Streak',
      value: `${analytics.commitStreak} days`,
      subtitle: 'Keep it going!',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      icon: Target,
      label: 'Push Success Rate',
      value: `${analytics.pushSuccessRate}%`,
      subtitle: `${analytics.successfulPushes}/${analytics.totalCommits}`,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: FileText,
      label: 'Files Changed',
      value: analytics.totalFilesChanged,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    },
    {
      icon: TrendingUp,
      label: 'Lines Added',
      value: `+${analytics.linesAdded.toLocaleString()}`,
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      icon: TrendingUp,
      label: 'Lines Removed',
      value: `-${analytics.linesRemoved.toLocaleString()}`,
      color: 'text-red-400',
      bg: 'bg-red-400/10'
    },
    {
      icon: Zap,
      label: 'Remote Switches',
      value: analytics.remoteSwitches,
      subtitle: 'Flexibility count',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
              <p className="text-sm text-gray-400">Your Git productivity metrics</p>
            </div>
          </div>
          
          <button
            onClick={onRefresh}
            className="btn-secondary text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="card hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${metric.bg}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </div>
              
              <div>
                <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                  {metric.value}
                </div>
                <div className="text-sm text-gray-400">{metric.label}</div>
                {metric.subtitle && (
                  <div className="text-xs text-gray-500 mt-1">{metric.subtitle}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Productivity Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Productivity Insights</h3>
        
        <div className="space-y-4">
          {/* Time Saved */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Time Saved Estimation</div>
                <div className="text-xs text-gray-400">
                  Based on ~6 seconds per manual commit cycle
                </div>
              </div>
              <div className="text-xl font-bold text-green-500">
                {formatTime(analytics.timeSavedSeconds)}
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((analytics.timeSavedSeconds / 3600) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Commit Quality */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Commit Reliability</div>
                <div className="text-xs text-gray-400">
                  Push success rate across all commits
                </div>
              </div>
              <div className="text-xl font-bold text-blue-500">
                {analytics.pushSuccessRate}%
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${analytics.pushSuccessRate}%` }}
              />
            </div>
          </div>

          {/* Code Changes */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div className="text-sm font-medium text-white">Code Impact</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Lines Added</div>
                <div className="text-lg font-bold text-green-400">
                  +{analytics.linesAdded.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Lines Removed</div>
                <div className="text-lg font-bold text-red-400">
                  -{analytics.linesRemoved.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              Net change: {(analytics.linesAdded - analytics.linesRemoved).toLocaleString()} lines
            </div>
          </div>

          {/* Streak Motivation */}
          {analytics.commitStreak > 0 && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
              <div className="flex items-center space-x-3">
                <Flame className="w-6 h-6 text-orange-500" />
                <div>
                  <div className="text-sm font-medium text-white">
                    {analytics.commitStreak} Day Streak! 🎉
                  </div>
                  <div className="text-xs text-gray-400">
                    Keep committing to maintain your streak
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Last Activity */}
      {analytics.lastCommit && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-2">Last Activity</h3>
          <p className="text-sm text-gray-400">
            Last commit: {new Date(analytics.lastCommit).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPanel;