'use client';

import { useState } from 'react';
import { FileText, Clipboard, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResumeUploaderProps {
  resumeText: string;
  setResumeText: (text: string) => void;
}

export default function ResumeUploader({ resumeText, setResumeText }: ResumeUploaderProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extractSuccess, setExtractSuccess] = useState('');

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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfJS();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;
    const allPageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent({ normalizeWhitespace: true });
      const viewport = page.getViewport({ scale: 1.0 });
      const pageHeight = viewport.height;

      interface TextItem {
        str: string;
        x: number;
        y: number;
        width: number;
        height: number;
        fontName: string;
      }

      const items: TextItem[] = textContent.items
        .filter((item: any) => 'str' in item && item.str.trim().length > 0)
        .map((item: any) => ({
          str: item.str,
          x: item.transform[4],
          y: pageHeight - item.transform[5],
          width: item.width,
          height: item.height,
          fontName: item.fontName || '',
        }));

      if (items.length === 0) continue;

      items.sort((a, b) => {
        const yDiff = a.y - b.y;
        if (Math.abs(yDiff) > 3) return yDiff;
        return a.x - b.x;
      });

      interface Row {
        y: number;
        height: number;
        items: TextItem[];
      }
      const rows: Row[] = [];
      let currentRow: TextItem[] = [items[0]];
      let currentY = items[0].y;

      for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const rowThreshold = Math.max(item.height * 0.6, 4);

        if (Math.abs(item.y - currentY) <= rowThreshold) {
          currentRow.push(item);
        } else {
          currentRow.sort((a, b) => a.x - b.x);
          const maxH = Math.max(...currentRow.map(it => it.height));
          rows.push({ y: currentY, height: maxH, items: currentRow });
          currentRow = [item];
          currentY = item.y;
        }
      }
      currentRow.sort((a, b) => a.x - b.x);
      const maxH = Math.max(...currentRow.map(it => it.height));
      rows.push({ y: currentY, height: maxH, items: currentRow });

      const allXs = items.map(it => it.x);
      const allMaxXs = items.map(it => it.x + it.width);
      const minX = Math.min(...allXs);
      const maxX = Math.max(...allMaxXs);
      const contentWidth = maxX - minX;

      let isTwoColumn = false;
      let dividerX = 0;

      if (contentWidth > 150) {
        const startTestX = minX + 0.3 * contentWidth;
        const endTestX = minX + 0.7 * contentWidth;
        let bestX = 0;
        let minCrossingCount = Infinity;

        for (let testX = startTestX; testX <= endTestX; testX += 5) {
          let crossing = 0;
          let leftSide = 0;
          let rightSide = 0;

          for (const item of items) {
            if (item.x < testX - 2 && item.x + item.width > testX + 2) {
              crossing++;
            } else if (item.x + item.width <= testX) {
              leftSide++;
            } else if (item.x >= testX) {
              rightSide++;
            }
          }

          if (leftSide > 0.15 * items.length && rightSide > 0.15 * items.length) {
            if (crossing < minCrossingCount) {
              minCrossingCount = crossing;
              bestX = testX;
            }
          }
        }

        if (bestX > 0 && (minCrossingCount <= 6 || minCrossingCount < 0.08 * items.length)) {
          isTwoColumn = true;
          dividerX = bestX;
        }
      }

      const pageLines: string[] = [];

      const reconstructSingleColumn = (blockRows: Row[]): string[] => {
        const linesList: string[] = [];
        let prevY = 0;
        for (const row of blockRows) {
          if (prevY > 0 && row.y - prevY > row.height * 1.8) {
            linesList.push('');
          }
          let lineText = '';
          for (let i = 0; i < row.items.length; i++) {
            const item = row.items[i];
            if (i > 0) {
              const prevItem = row.items[i - 1];
              const spaceGap = item.x - (prevItem.x + prevItem.width);
              if (spaceGap > prevItem.height * 2) {
                lineText += '    ';
              } else if (spaceGap > 1) {
                lineText += ' ';
              }
            }
            lineText += item.str;
          }
          linesList.push(lineText.trim());
          prevY = row.y;
        }
        return linesList;
      };

      if (isTwoColumn) {
        interface Block {
          type: 'spanning' | 'twocolumn';
          rows: Row[];
        }
        const blocks: Block[] = [];
        let currentBlockType: 'spanning' | 'twocolumn' = 'spanning';
        let currentBlockRows: Row[] = [];

        for (const row of rows) {
          const hasSpanningItem = row.items.some(item => 
            item.x < dividerX - 4 && item.x + item.width > dividerX + 4 && item.width > 0.35 * contentWidth
          );

          const rowType = hasSpanningItem ? 'spanning' : 'twocolumn';

          if (currentBlockRows.length === 0) {
            currentBlockType = rowType;
            currentBlockRows.push(row);
          } else if (currentBlockType === rowType) {
            currentBlockRows.push(row);
          } else {
            blocks.push({ type: currentBlockType, rows: currentBlockRows });
            currentBlockType = rowType;
            currentBlockRows = [row];
          }
        }
        if (currentBlockRows.length > 0) {
          blocks.push({ type: currentBlockType, rows: currentBlockRows });
        }

        for (const block of blocks) {
          if (block.type === 'spanning') {
            pageLines.push(...reconstructSingleColumn(block.rows));
          } else {
            const leftRows: Row[] = [];
            const rightRows: Row[] = [];

            for (const row of block.rows) {
              const leftRowItems = row.items.filter(item => item.x + item.width / 2 < dividerX);
              const rightRowItems = row.items.filter(item => item.x + item.width / 2 >= dividerX);

              if (leftRowItems.length > 0) {
                leftRows.push({ y: row.y, height: row.height, items: leftRowItems });
              }
              if (rightRowItems.length > 0) {
                rightRows.push({ y: row.y, height: row.height, items: rightRowItems });
              }
            }

            const leftText = reconstructSingleColumn(leftRows).filter(Boolean).join('\n');
            const rightText = reconstructSingleColumn(rightRows).filter(Boolean).join('\n');

            if (leftText) pageLines.push(leftText);
            if (rightText) pageLines.push(rightText);
          }
        }
      } else {
        pageLines.push(...reconstructSingleColumn(rows));
      }

      allPageTexts.push(pageLines.filter(line => line !== null).join('\n'));
    }

    const fullText = allPageTexts.join('\n\n--- Page ---\n\n');

    return fullText
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();
  };

  const loadMammoth = () => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).mammoth) {
        resolve((window as any).mammoth);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      script.onload = () => {
        resolve((window as any).mammoth);
      };
      script.onerror = () => reject(new Error("Impossible de charger le moteur d'extraction Word (Mammoth.js)."));
      document.head.appendChild(script);
    });
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const mammothInstance = await loadMammoth();
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammothInstance.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractError('');
    setExtractSuccess('');
    setIsExtracting(true);

    try {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setResumeText(event.target.result as string);
            setExtractSuccess(`Fichier texte chargé (${(file.size / 1024).toFixed(1)} Ko)`);
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
          throw new Error("Aucun texte lisible n'a pu être extrait du PDF. Ce PDF est peut-être un scan d'image. Essayez de copier-coller le texte manuellement.");
        }
        setResumeText(text);
        const wordCount = text.split(/\s+/).length;
        setExtractSuccess(`PDF extrait avec succès — ${wordCount} mots détectés (${(file.size / 1024).toFixed(1)} Ko)`);
        setIsExtracting(false);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        const text = await extractTextFromDocx(file);
        if (!text || text.trim().length === 0) {
          throw new Error("Aucun texte n'a pu être extrait du document Word. Essayez de copier-coller le texte.");
        }
        setResumeText(text);
        const wordCount = text.split(/\s+/).length;
        setExtractSuccess(`Word extrait avec succès — ${wordCount} mots détectés (${(file.size / 1024).toFixed(1)} Ko)`);
        setIsExtracting(false);
      } else {
        throw new Error("Format non pris en charge. Importez un fichier .pdf, .txt ou .docx.");
      }
    } catch (err: any) {
      console.error(err);
      setExtractError(err.message || "Erreur lors de l'extraction du texte.");
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
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
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent-soft" /> 1. Votre CV Actuel
        </h3>
        
        <div className="flex bg-background p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'paste' ? 'bg-accent text-white' : 'text-muted hover:text-foreground'
            }`}
          >
            Copier-Coller
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'upload' ? 'bg-accent text-white' : 'text-muted hover:text-foreground'
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
            className="input-field resize-none font-mono"
          />
          <div className="flex items-center gap-1.5 text-muted text-[10px] mt-2">
            <Clipboard className="h-3 w-3" />
            <span>Coller le texte brut est la méthode la plus rapide et la plus fiable pour l&apos;analyse IA.</span>
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
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              isDragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30 bg-background/50'
            }`}
          >
            {isExtracting ? (
              <div className="flex flex-col items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-3" />
                <span className="text-sm font-semibold text-accent-soft">Extraction du texte en cours...</span>
                <span className="text-xs text-muted mt-1">Analyse de la structure du document</span>
              </div>
            ) : (
              <>
                <FileText className="h-10 w-10 text-muted mb-3" />
                <span className="text-sm font-semibold text-foreground">Glissez-déposez votre CV ici</span>
                <span className="text-xs text-muted mt-1">PDF, TXT ou DOCX acceptés</span>
                
                <label className="mt-4 bg-surface hover:bg-surface-alt text-xs font-semibold py-2 px-4 rounded-lg border border-border cursor-pointer transition-all">
                  Parcourir le fichier
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.txt,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isExtracting}
                  />
                </label>
              </>
            )}
          </div>

          {extractError && (
            <div className="mt-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{extractError}</span>
            </div>
          )}

          {extractSuccess && !extractError && (
            <div className="mt-4 p-3 bg-success/10 border border-success/20 text-success text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{extractSuccess}</span>
            </div>
          )}

          {resumeText && !isExtracting && (
            <div className="mt-4 p-3 bg-background border border-border rounded-xl">
              <span className="text-[10px] font-bold text-success uppercase tracking-wider block mb-1">Contenu extrait avec succès</span>
              <p className="text-xs text-muted line-clamp-4 font-mono whitespace-pre-line">{resumeText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
