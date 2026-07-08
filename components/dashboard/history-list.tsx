'use client';

import { Generation } from '@/types';
import { History, Calendar, ArrowRight } from 'lucide-react';

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
      <div className="card p-6 text-center">
        <History className="h-8 w-8 text-muted mx-auto mb-2" />
        <span className="text-sm font-semibold text-foreground block">Aucune génération récente</span>
        <p className="text-xs text-muted mt-1">Vos optimisations de CV apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
        <History className="h-4 w-4 text-accent-soft" /> Historique
      </h3>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {generations.map((gen) => {
          const isSelected = selectedId === gen.id;
          return (
            <button
              key={gen.id}
              onClick={() => onSelect(gen)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'border-accent bg-accent/5 text-foreground'
                  : 'border-border hover:border-accent/20 bg-background/40 hover:bg-surface text-muted'
              }`}
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground block truncate">{gen.job_title}</span>
                <span className="text-[10px] text-muted flex items-center gap-1 mt-1 font-mono">
                  <Calendar className="h-3 w-3" /> {formatDate(gen.created_at)}
                </span>
              </div>
              <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-accent-soft' : 'text-muted'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
