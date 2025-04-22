import React from 'react';
import { SyncState } from '../../shared/types/sync';

interface SyncButtonProps {
  articleId: string;
  state: SyncState;
  onSync: (articleId: string) => void;
}

const SyncButton: React.FC<SyncButtonProps> = ({ articleId, state, onSync }) => {
  const isSyncing = state.status === 'syncing';
  const isSuccess = state.status === 'success';
  const isFailed = state.status === 'failed';

  const getButtonClass = () => {
    if (isSyncing) {
      return 'bg-blue-500 hover:bg-blue-600';
    } else if (isSuccess) {
      return 'bg-green-500 hover:bg-green-600';
    } else if (isFailed) {
      return 'bg-red-500 hover:bg-red-600';
    } else {
      return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getButtonText = () => {
    if (isSyncing) {
      return '同步中...';
    } else if (isSuccess) {
      return '同步成功';
    } else if (isFailed) {
      return '同步失败';
    } else {
      return '同步';
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSync(articleId)}
      disabled={isSyncing}
      className={`px-4 py-2 text-white rounded-md ${getButtonClass()} ${
        isSyncing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {getButtonText()}
    </button>
  );
};

export default SyncButton; 