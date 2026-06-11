'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Crown, Sparkles } from 'lucide-react';

interface TemplateGalleryProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  isPremium: boolean;
}

const TEMPLATES = [
  {
    id: 'professional',
    name: 'Classic ATS',
    description: 'Structure classique optimisée pour les systèmes de recrutement. Idéal pour les profils corporate.',
    preview: '/templates/classic.png',
    tags: ['ATS-friendly', 'Corporate'],
    premium: false,
  },
  {
    id: 'modern',
    name: 'Modern Blue',
    description: 'Design contemporain avec accents bleu marine. Parfait pour les profils tech et digital.',
    preview: '/templates/modern.png',
    tags: ['Moderne', 'Tech'],
    premium: false,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Template premium pour les postes de direction et management. Élégant et sophistiqué.',
    preview: '/templates/executive.png',
    tags: ['Direction', 'Premium'],
    premium: true,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Design épuré et minimaliste. Beaucoup d\'espace blanc pour une lisibilité maximale.',
    preview: '/templates/minimal.png',
    tags: ['Épuré', 'Design'],
    premium: true,
  },
];

export default function TemplateGallery({ selectedTemplate, onSelectTemplate, isPremium }: TemplateGalleryProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
          Modèles de CV
        </h3>
        <span className="text-[10px] text-slate-500">{TEMPLATES.length} modèles disponibles</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEMPLATES.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const isLocked = template.premium && !isPremium;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                if (!isLocked) {
                  onSelectTemplate(template.id);
                }
              }}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              disabled={isLocked}
              className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-cyan-400 shadow-lg shadow-cyan-500/15 scale-[1.02]'
                  : isLocked
                    ? 'border-slate-800/50 opacity-60 cursor-not-allowed'
                    : 'border-slate-800 hover:border-slate-600 hover:shadow-md'
              }`}
            >
              {/* Preview Image */}
              <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden">
                <Image
                  src={template.preview}
                  alt={`Template ${template.name}`}
                  fill
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-cyan-400/10 flex items-center justify-center">
                    <div className="bg-cyan-400 rounded-full p-1.5 shadow-lg shadow-cyan-500/30">
                      <Check className="h-4 w-4 text-slate-950" strokeWidth={3} />
                    </div>
                  </div>
                )}

                {/* Lock overlay for premium */}
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1.5">
                    <Crown className="h-5 w-5 text-amber-400" />
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">Premium</span>
                  </div>
                )}

                {/* Hover info overlay */}
                {hoveredTemplate === template.id && !isLocked && !isSelected && (
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center transition-opacity">
                    <span className="text-xs font-semibold text-white bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                      Sélectionner
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 bg-slate-950/80">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {template.name}
                  </span>
                  {template.premium && (
                    <Crown className="h-3 w-3 text-amber-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{template.description}</p>
                <div className="flex gap-1 mt-1.5">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
