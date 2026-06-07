'use client';

import { Briefcase, AlertCircle } from 'lucide-react';

interface JobInputProps {
  jobTitle: string;
  setJobTitle: (title: string) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
}

export default function JobInput({
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
}: JobInputProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Briefcase className="h-4.5 w-4.5 text-indigo-400" /> 2. L'Offre Ciblée
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Intitulé du Poste
          </label>
          <input
            type="text"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="ex: Développeur Full Stack Senior, Product Manager..."
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder:text-slate-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Description de l'Offre
          </label>
          <textarea
            required
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            placeholder="Copiez et collez l'intégralité de l'offre d'emploi (missions, profil recherché, compétences clés...)"
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-sm outline-none transition-all placeholder:text-slate-700 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
