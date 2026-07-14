import { create } from 'zustand';

export const useConfirmStore = create((set) => ({
  isOpen: false,
  title: '',
  description: '',
  onConfirm: null,
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  isLoading: false,

  confirm: ({ title, description, onConfirm, confirmLabel = 'Delete', cancelLabel = 'Cancel' }) => {
    set({
      isOpen: true,
      title,
      description,
      onConfirm,
      confirmLabel,
      cancelLabel,
      isLoading: false
    });
  },

  close: () => {
    set({ isOpen: false, isLoading: false });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  }
}));
