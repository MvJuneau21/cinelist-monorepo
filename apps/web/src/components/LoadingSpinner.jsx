// src/components/LoadingSpinner.jsx
import { Loader2 } from 'lucide-react';

function LoadingSpinner({ text = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-300">
      <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-3" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

export default LoadingSpinner;