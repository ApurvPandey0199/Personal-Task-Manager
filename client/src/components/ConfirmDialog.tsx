import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isConfirming = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-card-border bg-card/90 backdrop-blur-md shadow-2xl p-6 transition-all duration-300 scale-100 flex flex-col items-center text-center gap-4">
        <div className="p-3 bg-danger-light dark:bg-red-950/20 text-danger rounded-full">
          <AlertTriangle size={28} />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-muted text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3 w-full pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border border-card-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isConfirming}
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger/90 disabled:opacity-50 rounded-lg transition-colors min-h-[38px]"
          >
            {isConfirming ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
