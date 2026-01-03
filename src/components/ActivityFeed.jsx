import React from 'react';
import { Activity, CheckCircle, XCircle, Info } from 'lucide-react';

function ActivityFeed({ logs }) {
  const getLogIcon = (log) => {
    const action = log?.action || "";  // never undefined
    if (action.startsWith("✓")) return "✔️";
    if (action.startsWith("❌") || action.startsWith("✗")) return "❗";
    return "ℹ️";
  };


  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="card h-full">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-semibold text-white">Activity Feed</h2>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No activity yet
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-900 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start space-x-2">
                {getLogIcon(log)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 break-words">
                    {log.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(log.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;