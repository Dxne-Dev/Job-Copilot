'use client';

import { Briefcase } from 'lucide-react';

interface JobInputProps {
  jobOffer: string;
  setJobOffer: (offer: string) => void;
}

export default function JobInput({
  jobOffer,
  setJobOffer,
}: JobInputProps) {
  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-accent-soft" /> 2. Offre d&apos;emploi ou URL
      </h3>

      <div>
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Collez l&apos;offre complète ou l&apos;URL de l&apos;offre
        </label>
        <textarea
          required
          value={jobOffer}
          onChange={(e) => setJobOffer(e.target.value)}
          rows={6}
          placeholder="Ex. : collez le texte de l&apos;offre ou copiez l&apos;URL d&apos;une annonce LinkedIn / Welcome to the Jungle / Greenhouse…"
          className="input-field resize-none"
        />
        <p className="mt-2 text-[11px] text-muted">L&apos;application récupérera automatiquement l&apos;intitulé et la description à partir de votre saisie.</p>
      </div>
    </div>
  );
}
