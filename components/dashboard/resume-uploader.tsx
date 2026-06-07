'use client';

import { useState } from 'react';
import { FileText, Clipboard, AlertCircle } from 'lucide-react';

interface ResumeUploaderProps {
  resumeText: string;
  setResumeText: (text: string) => void;
}

export default function ResumeUploader({ resumeText, setResumeText }: ResumeUploaderProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');

  const normalizeExtractedText = (text: string) =>
    text
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s*\n\s*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

  // Dynamically load PDF.js from cdnjs
  const loadPdfJS = () => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error("Impossible de charger le moteur d'extraction PDF (PDF.js)."));
      document.head.appendChild(script);
    });
  };

  // Extract text from PDF using PDF.js
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfJS();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent({ normalizeWhitespace: true });
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ');
      text += `${normalizeExtractedText(pageText)}\n`;
    }

    return normalizeExtractedText(text);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractError('');
    setIsExtracting(true);

    try {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setResumeText(event.target.result as string);
          }
          setIsExtracting(false);
        };
        reader.onerror = () => {
          setExtractError("Erreur lors de la lecture du fichier texte.");
          setIsExtracting(false);
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        if (!text || text.trim().length === 0) {
          throw new Error("Aucun texte lisible n'a pu être extrait du PDF.");
        }
        setResumeText(text);
        setIsExtracting(false);
      } else {
        throw new Error("Format de fichier non pris en charge. Veuillez importer un fichier .pdf ou .txt.");
      }
    } catch (err: any) {
      console.error(err);
      setExtractError(err.message || "Erreur lors de l'extraction du texte.");
      setIsExtracting(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-indigo-400" /> 1. Votre CV Actuel
        </h3>
        
        {/* Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'paste' ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Copier-Coller
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'upload' ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Importer
          </button>
        </div>
      </div>

      {activeTab === 'paste' ? (
        <div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
            placeholder="Copiez et collez le texte brut de votre CV actuel ici (Coordonnées, Profil, Expériences, Éducation, Compétences...)"
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-sm outline-none transition-all placeholder:text-slate-700 resize-none font-mono"
          />
          <div className="flex items-center gap-1.5 text-slate-650 text-[10px] mt-2">
            <Clipboard className="h-3 w-3" />
            <span>Coller le texte brut est la méthode la plus rapide et la plus fiable pour l'analyse IA.</span>
          </div>
        </div>
      ) : (
        <div>
          <div
            onDragOver={(e) => {
              if (isExtracting) return;
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              if (isExtracting) return;
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const input = document.getElementById('file-upload-input') as HTMLInputElement;
                if (input) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  input.files = dataTransfer.files;
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            }}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              isDragOver ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
            }`}
          >
            {isExtracting ? (
              <div className="flex flex-col items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3" />
                <span className="text-sm font-semibold text-indigo-400">Extraction du texte en cours...</span>
                <span className="text-xs text-slate-500 mt-1">Lecture du document PDF</span>
              </div>
            ) : (
              <>
                <FileText className="h-10 w-10 text-slate-600 mb-3" />
                <span className="text-sm font-semibold text-slate-300">Glissez-déposez votre CV ici</span>
                <span className="text-xs text-slate-500 mt-1">PDF ou TXT acceptés</span>
                
                <label className="mt-4 bg-slate-900 hover:bg-slate-850 text-xs font-semibold py-2 px-4 rounded-lg border border-slate-800 cursor-pointer transition-all">
                  Parcourir le fichier
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isExtracting}
                  />
                </label>
              </>
            )}
          </div>

          {extractError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{extractError}</span>
            </div>
          )}

          {resumeText && !isExtracting && (
            <div className="mt-4 p-3 bg-slate-950 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider block mb-1">Contenu extrait avec succès</span>
              <p className="text-xs text-slate-400 line-clamp-3 font-mono">{resumeText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
