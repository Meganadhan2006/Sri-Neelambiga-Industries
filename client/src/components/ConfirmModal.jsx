import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useConfirmStore } from '../store/useConfirmStore';

const ConfirmModal = () => {
  const { 
    isOpen, 
    title, 
    description, 
    onConfirm, 
    confirmLabel, 
    cancelLabel, 
    isLoading, 
    close 
  } = useConfirmStore();

  const handleConfirm = async () => {
    if (onConfirm) {
      try {
        await onConfirm();
      } catch (error) {
        console.error('Error during confirmation callback:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : close}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative bg-card w-full max-w-sm rounded-2xl border border-border-main/80 p-6 shadow-2xl overflow-hidden z-10"
          >
            <div className="flex flex-col items-center text-center">
              {/* Warning Circle Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4 animate-bounce-subtle">
                <AlertTriangle className="h-6 w-6" />
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-text-main leading-tight mb-2">
                {title || 'Are you sure?'}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed mb-6">
                {description || 'This action cannot be undone.'}
              </p>

              {/* Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={close}
                  className="flex-1 px-4 py-2.5 rounded-full text-xs font-semibold border border-border-main text-text-muted hover:text-text-main hover:bg-secondary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>{confirmLabel}</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
