'use client';

import { Briefcase, AlertCircle } from 'lucide-react';

interface JobInputProps {
  jobOffer: string;
  setJobOffer: (offer: string) => void;
}

export default function JobInput({
  jobOffer,
  setJobOffer,
}: JobInputProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Briefcase className="h-4.5 w-4.5 text-indigo-400" /> 2. Offre d’emploi ou URL
      </h3>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Collez l’offre complète ou l’URL de l’offre
        </label>
        <textarea
          required
          value={jobOffer}
          onChange={(e) => setJobOffer(e.target.value)}
          rows={6}
          placeholder="Ex. : collez le texte de l’offre ou copiez l’URL d’une annonce LinkedIn / Welcome to the Jungle / Greenhouse…"
          className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-sm outline-none transition-all placeholder:text-slate-700 resize-none"
        />
        <p className="mt-2 text-[11px] text-slate-500">L’application récupérera automatiquement l’intitulé et la description à partir de votre saisie.</p>
      </div>
    </div>
  );
}
