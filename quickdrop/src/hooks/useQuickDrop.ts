import { useContext } from 'react';
import { QuickDropContext } from '@/contexts/quickDropContextValue';

export const useQuickDrop = () => {
  const context = useContext(QuickDropContext);
  if (!context) {
    throw new Error('useQuickDrop must be used inside QuickDropProvider.');
  }
  return context;
};
