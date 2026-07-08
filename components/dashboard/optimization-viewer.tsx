'use client';

import { useState } from 'react';
import { OptimizedResumeResponse } from '@/types';
import { Clipboard, Check, Download, Sparkles, Lock, ShieldAlert } from 'lucide-react';
import TemplateGallery from './template-gallery';

interface OptimizationViewerProps {
  data: OptimizedResumeResponse;
  isPremium: boolean;
  onUpgrade: () => void;
  upgradeLoading: boolean;
}

export default function OptimizationViewer({
  data,
  isPremium,
  onUpgrade,
  upgradeLoading
}: OptimizationViewerProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'experiences' | 'skills' | 'letter' | 'analysis'>('profile');

  const [templateId, setTemplateId] = useState<string>('professional');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLocation, setContactLocation] = useState('');
  const [contactWebsite, setContactWebsite] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadTxt = () => {
    const experiencesText = (data.experiences || []).map(exp => 
      `${exp.role || ''} - ${exp.company || ''} (${exp.duration || ''})\n` + 
      (exp.achievements || []).map(ach => `* ${ach}`).join('\n')
    ).join('\n\n');

    const content = `=== PROFIL ===
${data.profile?.headline || ''}
${data.profile?.summary || ''}

=== EXPERIENCES OPTIMISEES ===
${experiencesText}

=== COMPETENCES ATS ===
Techniques: ${(data.skills?.technical || []).join(', ')}
Soft Skills: ${(data.skills?.soft || []).join(', ')}

=== LETTRE DE MOTIVATION ===
${data.coverLetter || ''}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv_optimise_jobcopilot.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportLatex = async (format: 'pdf' | 'tex') => {
    if (!contactName || !contactEmail) {
      setErrorMsg('Veuillez renseigner au moins votre nom et votre email.');
      return;
    }
    setErrorMsg('');
    setExportLoading(true);

    try {
      const response = await fetch('/api/compile-latex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optimizedData: data,
          contact: {
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            location: contactLocation,
            website: contactWebsite,
          },
          templateId,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la compilation.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'pdf' 
        ? `cv_${contactName.toLowerCase().replace(/\s+/g, '_')}.pdf`
        : `cv_${contactName.toLowerCase().replace(/\s+/g, '_')}.tex`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Impossible de compiler le PDF. Le compilateur en ligne est peut-être saturé.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-accent-soft uppercase tracking-widest block mb-1">Analyse Terminée</span>
          <h2 className="text-xl font-extrabold text-foreground">Votre profil a été restructuré avec succès !</h2>
          <p className="text-xs text-muted mt-1">L&apos;IA a adapté vos réalisations pour correspondre aux mots-clés ATS clés de l&apos;offre.</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center px-4 py-3 bg-background border border-border rounded-xl">
            <span className="text-[10px] text-muted block uppercase tracking-wider">Score ATS estimé</span>
            <span className="text-2xl font-black text-success">{data.analysis?.atsScore || 0}%</span>
          </div>
          <button
            onClick={handleDownloadTxt}
            className="btn-ghost text-xs py-3"
          >
            <Download className="h-4 w-4" /> .TXT
          </button>
        </div>
      </div>

      {/* Template Gallery Section */}
      <div className="card p-6">
        <TemplateGallery
          selectedTemplate={templateId}
          onSelectTemplate={setTemplateId}
          isPremium={isPremium}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Results Viewer */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto bg-surface/50">
            {(['profile', 'experiences', 'skills', 'letter', 'analysis'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-semibold px-5 py-4 border-b-2 whitespace-nowrap transition-all outline-none cursor-pointer ${
                  activeTab === tab
                    ? 'border-accent text-foreground bg-accent/5'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                {tab === 'profile' && 'Profil'}
                {tab === 'experiences' && 'Expériences'}
                {tab === 'skills' && 'Compétences'}
                {tab === 'letter' && 'Lettre de Motivation'}
                {tab === 'analysis' && 'Analyse Forces/Faiblesses'}
              </button>
            ))}
          </div>

          <div className="p-6">
            
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Titre & Résumé optimisés</h4>
                  <button
                    onClick={() => triggerCopy(`${data.profile?.headline || ''}\n\n${data.profile?.summary || ''}`, 'profile')}
                    className="text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedText === 'profile' ? <Check className="h-4 w-4 text-success" /> : <Clipboard className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl space-y-3">
                  <div className="font-bold text-foreground border-b border-border pb-2">{data.profile?.headline || 'Profil'}</div>
                  <p className="text-sm text-muted leading-relaxed">{data.profile?.summary || 'Aucun résumé disponible.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'experiences' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Parcours Professionnel Adapté</h4>
                  <button
                    onClick={() => {
                      const expStr = (data.experiences || []).map(e => `${e.role || ''} @ ${e.company || ''}\n` + (e.achievements || []).map(a => `- ${a}`).join('\n')).join('\n\n');
                      triggerCopy(expStr, 'experiences');
                    }}
                    className="text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedText === 'experiences' ? <Check className="h-4 w-4 text-success" /> : <Clipboard className="h-4 w-4" />}
                  </button>
                </div>
                <div className="space-y-4">
                  {(data.experiences || []).map((exp, index) => (
                    <div key={index} className="p-4 bg-background border border-border rounded-xl space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-foreground">{exp.role}</span>
                        <span className="text-muted font-mono">{exp.duration}</span>
                      </div>
                      <div className="text-xs text-accent-soft font-semibold mb-2">{exp.company}</div>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-muted leading-relaxed">
                        {(exp.achievements || []).map((ach, aIdx) => (
                          <li key={aIdx}>{ach}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Mots-clés & Compétences ATS</h4>
                  <button
                    onClick={() => triggerCopy(`Techniques: ${(data.skills?.technical || []).join(', ')}\nSoft: ${(data.skills?.soft || []).join(', ')}`, 'skills')}
                    className="text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedText === 'skills' ? <Check className="h-4 w-4 text-success" /> : <Clipboard className="h-4 w-4" />}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-accent-soft uppercase tracking-wider block mb-2">Hard Skills / Techniques</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(data.skills?.technical || []).map((skill, index) => (
                        <span key={index} className="text-xs bg-accent/10 text-accent-soft border border-accent/10 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-background border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-accent-soft uppercase tracking-wider block mb-2">Soft Skills / Comportemental</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(data.skills?.soft || []).map((skill, index) => (
                        <span key={index} className="text-xs bg-accent/10 text-accent-soft border border-accent/10 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'letter' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Lettre de Motivation (300-400 mots)</h4>
                  <button
                    onClick={() => triggerCopy(data.coverLetter || '', 'letter')}
                    className="text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedText === 'letter' ? <Check className="h-4 w-4 text-success" /> : <Clipboard className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl">
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{data.coverLetter || 'Aucune lettre générée.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Forces & Axes d&apos;amélioration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-success/5 border border-success/10 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider block">Forces du profil</span>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-muted">
                      {(data.analysis?.strengths || []).map((str, index) => (
                        <li key={index}>{str}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-danger/5 border border-danger/10 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-danger uppercase tracking-wider block">Points à valoriser ou améliorer</span>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-muted">
                      {(data.analysis?.weaknesses || []).map((weak, index) => (
                        <li key={index}>{weak}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Export Panel */}
        <div className="card p-6 relative overflow-hidden">
          
          {!isPremium && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20">
              <Lock className="h-8 w-8 text-accent-soft mb-3" />
              <h4 className="text-base font-bold text-foreground mb-2">Export Premium PDF</h4>
              <p className="text-xs text-muted max-w-xs mb-6">
                Générez instantanément votre CV dans le modèle sélectionné. Exportations illimitées en PDF de haute qualité.
              </p>
              <button
                onClick={onUpgrade}
                disabled={upgradeLoading}
                className="btn-primary text-xs"
              >
                {upgradeLoading ? 'Chargement...' : 'Débloquer pour 19€/mois'}
              </button>
            </div>
          )}

          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-accent-soft" /> Export PDF
          </h3>

          <div className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-1.5 bg-danger/10 border border-danger/20 text-danger text-[10px] rounded-lg p-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Coordonnées du CV</span>
              
              <input
                type="text"
                placeholder="Nom Prénom"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="input-field text-xs"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input-field text-xs"
                />
                <input
                  type="text"
                  placeholder="Téléphone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Ville, Pays"
                  value={contactLocation}
                  onChange={(e) => setContactLocation(e.target.value)}
                  className="input-field text-xs"
                />
                <input
                  type="text"
                  placeholder="LinkedIn / Site"
                  value={contactWebsite}
                  onChange={(e) => setContactWebsite(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => handleExportLatex('pdf')}
                disabled={exportLoading}
                className="btn-primary w-full text-xs"
              >
                {exportLoading ? 'Génération...' : 'Télécharger le CV en PDF'}
              </button>
              <button
                type="button"
                onClick={() => handleExportLatex('tex')}
                disabled={exportLoading}
                className="btn-ghost w-full text-xs"
              >
                Format éditable (.tex)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
