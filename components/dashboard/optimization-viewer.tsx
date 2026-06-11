'use client';

import { useState } from 'react';
import { OptimizedResumeResponse } from '@/types';
import { Clipboard, Check, Download, Sparkles, FileText, Lock, ShieldAlert, Cpu } from 'lucide-react';
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

  // Template states
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

  // Basic Txt download for free tier
  const handleDownloadTxt = () => {
    const experiencesText = data.experiences.map(exp => 
      `${exp.role} - ${exp.company} (${exp.duration})\n` + 
      exp.achievements.map(ach => `* ${ach}`).join('\n')
    ).join('\n\n');

    const content = `=== PROFIL ===
${data.profile.headline}
${data.profile.summary}

=== EXPERIENCES OPTIMISEES ===
${experiencesText}

=== COMPETENCES ATS ===
Techniques: ${data.skills.technical.join(', ')}
Soft Skills: ${data.skills.soft.join(', ')}

=== LETTRE DE MOTIVATION ===
${data.coverLetter}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv_optimise_jobcopilot.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // LaTeX & PDF export for premium tier
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

      // Download file blob
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-900 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Analyse Terminée</span>
          <h2 className="text-xl font-extrabold text-slate-200">Votre profil a été restructuré avec succès !</h2>
          <p className="text-xs text-slate-500 mt-1">L'IA a adapté vos réalisations pour correspondre aux mots-clés ATS clés de l'offre.</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center px-4 py-3 bg-slate-950/80 border border-slate-850 rounded-xl">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Score ATS estimé</span>
            <span className="text-2xl font-black text-green-400">{data.analysis.atsScore}%</span>
          </div>
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold py-3 px-4 rounded-xl transition-all"
          >
            <Download className="h-4 w-4" /> Télécharger .TXT
          </button>
        </div>
      </div>

      {/* Template Gallery Section */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
        <TemplateGallery
          selectedTemplate={templateId}
          onSelectTemplate={setTemplateId}
          isPremium={isPremium}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Results Viewer */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden backdrop-blur-md">
          {/* Tabs header */}
          <div className="flex border-b border-slate-900 overflow-x-auto bg-slate-950/50">
            {['profile', 'experiences', 'skills', 'letter', 'analysis'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-xs font-semibold px-5 py-4 border-b-2 whitespace-nowrap transition-all outline-none ${
                  activeTab === tab
                    ? 'border-indigo-500 text-white bg-slate-900/20'
                    : 'border-transparent text-slate-550 hover:text-slate-350'
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

          {/* Tab Content */}
          <div className="p-6">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Titre & Résumé optimisés</h4>
                  <button
                    onClick={() => triggerCopy(`${data.profile.headline}\n\n${data.profile.summary}`, 'profile')}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {copiedText === 'profile' ? <Check className="h-4.5 w-4.5 text-green-400" /> : <Clipboard className="h-4.5 w-4.5" />}
                  </button>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <div className="font-bold text-slate-200 border-b border-slate-900 pb-2">{data.profile.headline}</div>
                  <p className="text-sm text-slate-400 leading-relaxed font-sans">{data.profile.summary}</p>
                </div>
              </div>
            )}

            {/* Experiences Tab */}
            {activeTab === 'experiences' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Parcours Professionnel Adapté</h4>
                  <button
                    onClick={() => {
                      const expStr = data.experiences.map(e => `${e.role} @ ${e.company}\n` + e.achievements.map(a => `- ${a}`).join('\n')).join('\n\n');
                      triggerCopy(expStr, 'experiences');
                    }}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {copiedText === 'experiences' ? <Check className="h-4.5 w-4.5 text-green-400" /> : <Clipboard className="h-4.5 w-4.5" />}
                  </button>
                </div>
                <div className="space-y-4">
                  {data.experiences.map((exp, index) => (
                    <div key={index} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-200">{exp.role}</span>
                        <span className="text-slate-500 font-mono">{exp.duration}</span>
                      </div>
                      <div className="text-xs text-indigo-400 font-semibold mb-2">{exp.company}</div>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-450 leading-relaxed">
                        {exp.achievements.map((ach, aIdx) => (
                          <li key={aIdx}>{ach}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mots-clés & Compétences ATS</h4>
                  <button
                    onClick={() => triggerCopy(`Techniques: ${data.skills.technical.join(', ')}\nSoft: ${data.skills.soft.join(', ')}`, 'skills')}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {copiedText === 'skills' ? <Check className="h-4.5 w-4.5 text-green-400" /> : <Clipboard className="h-4.5 w-4.5" />}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">Hard Skills / Techniques</span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.technical.map((skill, index) => (
                        <span key={index} className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-2">Soft Skills / Comportemental</span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.soft.map((skill, index) => (
                        <span key={index} className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/10 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cover Letter Tab */}
            {activeTab === 'letter' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lettre de Motivation (300-400 mots)</h4>
                  <button
                    onClick={() => triggerCopy(data.coverLetter, 'letter')}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {copiedText === 'letter' ? <Check className="h-4.5 w-4.5 text-green-400" /> : <Clipboard className="h-4.5 w-4.5" />}
                  </button>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                  <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line font-sans">{data.coverLetter}</p>
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Forces & Axes d'amélioration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider block">Forces du profil</span>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                      {data.analysis.strengths.map((str, index) => (
                        <li key={index}>{str}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block">Points à valoriser ou améliorer</span>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                      {data.analysis.weaknesses.map((weak, index) => (
                        <li key={index}>{weak}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Export & Generation panel */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          
          {!isPremium && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-20">
              <Lock className="h-8 w-8 text-indigo-400 mb-3" />
              <h4 className="text-base font-bold text-white mb-2">Export Premium PDF</h4>
              <p className="text-xs text-slate-400 max-w-xs mb-6">
                Générez instantanément votre CV dans le modèle sélectionné. Exportations illimitées en PDF de haute qualité.
              </p>
              <button
                onClick={onUpgrade}
                disabled={upgradeLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                {upgradeLoading ? 'Chargement...' : 'Débloquer pour 19€/mois'}
              </button>
            </div>
          )}

          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" /> Export PDF Professionnel
          </h3>

          <div className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-1.5 bg-red-500/10 border border-red-500/20 text-red-200 text-[10px] rounded-lg p-2.5">
                <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Contact inputs */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Coordonnées du CV</span>
              
              <div>
                <input
                  type="text"
                  placeholder="Nom Prénom"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs outline-none text-slate-350 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs outline-none text-slate-350 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Téléphone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs outline-none text-slate-350 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Ville, Pays"
                  value={contactLocation}
                  onChange={(e) => setContactLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs outline-none text-slate-350 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="LinkedIn / Site"
                  value={contactWebsite}
                  onChange={(e) => setContactWebsite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs outline-none text-slate-350 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Export buttons */}
            <div className="space-y-2 border-t border-slate-900 pt-4">
              <button
                type="button"
                onClick={() => handleExportLatex('pdf')}
                disabled={exportLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {exportLoading ? 'Génération...' : 'Télécharger le CV en PDF'}
              </button>
              <button
                type="button"
                onClick={() => handleExportLatex('tex')}
                disabled={exportLoading}
                className="w-full border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1"
              >
                Télécharger le format éditable (.tex)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
