'use client';

import { Generation } from '@/types';
import { History, Calendar, ExternalLink, ArrowRight, Trash2 } from 'lucide-react';

interface HistoryListProps {
  generations: Generation[];
  onSelect: (gen: Generation) => void;
  selectedId?: string;
}

export default function HistoryList({ generations, onSelect, selectedId }: HistoryListProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (generations.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 text-center backdrop-blur-md">
        <History className="h-8 w-8 text-slate-650 mx-auto mb-2" />
        <span className="text-sm font-semibold text-slate-400 block">Aucune génération récente</span>
        <p className="text-xs text-slate-600 mt-1">Vos optimisations de CV apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider flex items-center gap-2 mb-2">
        <History className="h-4.5 w-4.5 text-indigo-400" /> Historique de vos CVs
      </h3>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {generations.map((gen) => {
          const isSelected = selectedId === gen.id;
          return (
            <button
              key={gen.id}
              onClick={() => onSelect(gen)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/5 text-white'
                  : 'border-slate-850 hover:border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400'
              }`}
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block truncate">{gen.job_title}</span>
                <span className="text-[10px] text-slate-650 flex items-center gap-1 mt-1 font-mono">
                  <Calendar className="h-3 w-3" /> {formatDate(gen.created_at)}
                </span>
              </div>
              <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-indigo-400' : 'text-slate-650'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
