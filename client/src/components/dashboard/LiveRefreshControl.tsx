import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Wifi, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface LiveRefreshControlProps {
  onRefresh: () => void;
  isLoading: boolean;
  autoRefreshIntervalSeconds?: number;
  lastUpdated?: string;
}

export const LiveRefreshControl: React.FC<LiveRefreshControlProps> = ({
  onRefresh,
  isLoading,
  autoRefreshIntervalSeconds = 30,
  lastUpdated,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(autoRefreshIntervalSeconds);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          onRefresh();
          return autoRefreshIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, autoRefreshIntervalSeconds, onRefresh]);

  const progressPercentage = ((autoRefreshIntervalSeconds - secondsRemaining) / autoRefreshIntervalSeconds) * 100;

  return (
    <div className="bg-tactical-900 border border-tactical-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-inner">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-white">CORRIDOR TELEMETRY:</span>
          <span className="text-emerald-400">ACTIVE</span>
        </div>

        {lastUpdated && (
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Countdown pill */}
        <div className="flex items-center gap-2 bg-tactical-950 px-2.5 py-1 rounded-lg border border-tactical-800 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Next auto-sync:</span>
          <span className="font-bold text-blue-400">{secondsRemaining}s</span>
          {/* Mini progress bar */}
          <div className="w-12 h-1.5 bg-tactical-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Manual Refresh Button */}
        <Button
          size="sm"
          variant="secondary"
          isLoading={isLoading}
          onClick={() => {
            setSecondsRemaining(autoRefreshIntervalSeconds);
            onRefresh();
          }}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          className="text-xs font-mono"
        >
          Force Refresh
        </Button>
      </div>
    </div>
  );
};
