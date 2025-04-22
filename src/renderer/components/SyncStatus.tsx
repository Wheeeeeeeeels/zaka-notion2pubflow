import React from 'react';
import { SyncState } from '../../shared/types/sync';

enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

interface SyncStatusProps {
  state: SyncState;
}

const SyncStatusComponent: React.FC<SyncStatusProps> = ({ state }) => {
  const getStatusColor = (status: SyncStatus) => {
    switch (status) {
      case SyncStatus.PENDING:
        return 'text-gray-500';
      case SyncStatus.SYNCING:
        return 'text-blue-500';
      case SyncStatus.SUCCESS:
        return 'text-green-500';
      case SyncStatus.FAILED:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: SyncStatus) => {
    switch (status) {
      case SyncStatus.PENDING:
        return '等待同步';
      case SyncStatus.SYNCING:
        return '同步中';
      case SyncStatus.SUCCESS:
        return '同步成功';
      case SyncStatus.FAILED:
        return '同步失败';
      default:
        return '未知状态';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(state.status)}`} />
      <span className={`text-sm ${getStatusColor(state.status)}`}>
        {getStatusText(state.status)}
      </span>
      {state.error && (
        <span className="text-sm text-red-500 ml-2">{state.error}</span>
      )}
      {state.lastSyncTime && (
        <span className="text-sm text-gray-500 ml-2">
          上次同步：{new Date(state.lastSyncTime).toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default SyncStatusComponent; 