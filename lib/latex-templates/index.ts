import { OptimizedResumeResponse } from '@/types';

// Helper to escape LaTeX special characters
export function escapeLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export interface UserContactInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
}

// Professional ATS LaTeX Template
export function generateProfessionalTemplate(data: OptimizedResumeResponse, contact: UserContactInfo): string {
  const name = escapeLatex(contact.name).toUpperCase();
  const email = escapeLatex(contact.email);
  const phone = contact.phone ? escapeLatex(contact.phone) : '';
  const location = contact.location ? escapeLatex(contact.location) : '';
  const website = contact.website ? escapeLatex(contact.website) : '';

  const contactLine = [phone, email, location, website].filter(Boolean).join(' | ');

  const summary = escapeLatex(data.profile?.summary);
  const headline = escapeLatex(data.profile?.headline);

  const experiencesTex = (data.experiences || []).map(exp => {
    const role = escapeLatex(exp.role || '');
    const company = escapeLatex(exp.company || '');
    const duration = escapeLatex(exp.duration || '');
    const achievements = (exp.achievements || []).map(ach => `\\item ${escapeLatex(ach)}`).join('\n');

    return `
\\textbf{${role}} \\hfill \\textit{${duration}} \\\\
\\textit{${company}} \\\\
\\begin{itemize}[leftmargin=15pt, topsep=2pt, itemsep=2pt]
${achievements}
\\end{itemize}
\\vspace{5pt}`;
  }).join('\n');

  const techSkills = (data.skills?.technical || []).map(escapeLatex).join(', ');
  const softSkills = (data.skills?.soft || []).map(escapeLatex).join(', ');

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.85in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\pagestyle{empty}

% Section formatting
\\titleformat{\\section}{\\large\\bfseries\\color{darkgray}}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\definecolor{darkgray}{HTML}{2D3748}

\\begin{document}

\\begin{center}
    {\\LARGE \\textbf{${name}}} \\\\
    \\vspace{3pt}
    {\\large \\textit{${headline}}} \\\\
    \\vspace{4pt}
    ${contactLine}
\\end{center}

\\section{R\\'{e}sum\\'{e} Professionnel}
${summary}

\\section{Exp\\'{e}riences Professionnelles}
${experiencesTex}

\\section{Comp\\'{e}tences}
\\textbf{Techniques :} ${techSkills} \\\\
\\textbf{Interpersonnelles :} ${softSkills}

\\end{document}`;
}

// Minimal/Modern ATS LaTeX Template
export function generateModernTemplate(data: OptimizedResumeResponse, contact: UserContactInfo): string {
  const name = escapeLatex(contact.name);
  const email = escapeLatex(contact.email);
  const phone = contact.phone ? escapeLatex(contact.phone) : '';
  const location = contact.location ? escapeLatex(contact.location) : '';
  const website = contact.website ? escapeLatex(contact.website) : '';

  const contactLine = [phone, email, location, website].filter(Boolean).join('  $\\bullet$  ');

  const summary = escapeLatex(data.profile?.summary);
  const headline = escapeLatex(data.profile?.headline);

  const experiencesTex = (data.experiences || []).map(exp => {
    const role = escapeLatex(exp.role || '');
    const company = escapeLatex(exp.company || '');
    const duration = escapeLatex(exp.duration || '');
    const achievements = (exp.achievements || []).map(ach => `\\item ${escapeLatex(ach)}`).join('\n');

    return `
\\noindent\\textbf{${role}} --- \\textit{${company}} \\hfill \\textbf{${duration}} \\\\
\\begin{itemize}[leftmargin=12pt, noitemsep, topsep=3pt]
${achievements}
\\end{itemize}
\\vspace{6pt}`;
  }).join('\n');

  const techSkills = (data.skills?.technical || []).map(escapeLatex).join(', ');
  const softSkills = (data.skills?.soft || []).map(escapeLatex).join(', ');

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}

% Modern blue accent color
\\usepackage{xcolor}
\\definecolor{accent}{HTML}{1A365D}

\\titleformat{\\section}{\\fontfamily{phv}\\selectfont\\bfseries\\color{accent}\\uppercase}{}{0em}{}
\\titlespacing{\\section}{0pt}{14pt}{4pt}

\\begin{document}

\\begin{center}
    {\\Huge \\fontfamily{phv}\\selectfont\\color{accent}\\textbf{${name}}} \\\\
    \\vspace{4pt}
    {\\large \\fontfamily{phv}\\selectfont ${headline}} \\\\
    \\vspace{6pt}
    {\\small ${contactLine}}
\\end{center}
\\vspace{10pt}

\\section{Profil}
\\hrule
\\vspace{4pt}
${summary}

\\section{Parcours Professionnel}
\\hrule
\\vspace{6pt}
${experiencesTex}

\\section{Comp\\'{e}tences Cl\\'{e}s}
\\hrule
\\vspace{6pt}
\\textbf{Comp\\'{e}tences techniques :} ${techSkills} \\\\
\\textbf{Comp\\'{e}tences comportementales :} ${softSkills}

\\end{document}`;
}

// Executive/Premium Template
export function generateExecutiveTemplate(data: OptimizedResumeResponse, contact: UserContactInfo): string {
  const name = escapeLatex(contact.name).toUpperCase();
  const email = escapeLatex(contact.email);
  const phone = contact.phone ? escapeLatex(contact.phone) : '';
  const location = contact.location ? escapeLatex(contact.location) : '';
  const website = contact.website ? escapeLatex(contact.website) : '';

  const contactLine = [phone, email, location, website].filter(Boolean).join('  \\textbullet{}  ');

  const summary = escapeLatex(data.profile?.summary);
  const headline = escapeLatex(data.profile?.headline);

  const experiencesTex = (data.experiences || []).map(exp => {
    const role = escapeLatex(exp.role || '');
    const company = escapeLatex(exp.company || '');
    const duration = escapeLatex(exp.duration || '');
    const achievements = (exp.achievements || []).map(ach => `\\item ${escapeLatex(ach)}`).join('\n');

    return `
\\noindent\\textbf{\\fontsize{11}{13}\\selectfont ${role}} \\hfill \\textbf{\\textcolor{accent}{${duration}}} \\\\
\\noindent\\textit{\\textcolor{gray}{${company}}} \\\\
\\begin{itemize}[leftmargin=15pt, topsep=3pt, itemsep=2.5pt]
${achievements}
\\end{itemize}
\\vspace{6pt}`;
  }).join('\n');

  const techSkills = (data.skills?.technical || []).map(escapeLatex).join(', ');
  const softSkills = (data.skills?.soft || []).map(escapeLatex).join(', ');

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\pagestyle{empty}

% Executive Charcoal & Amber Gold colors
\\definecolor{accent}{HTML}{B8860B} % Dark Goldenrod / Gold
\\definecolor{charcoal}{HTML}{1A1A1A}
\\definecolor{gray}{HTML}{4A4A4A}

\\titleformat{\\section}{\\large\\bfseries\\color{charcoal}\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{14pt}{6pt}

\\begin{document}

\\begin{center}
    {\\Huge \\textbf{\\color{charcoal}{${name}}}} \\\\
    \\vspace{4pt}
    {\\large \\textbf{\\textcolor{accent}{${headline}}}} \\\\
    \\vspace{6pt}
    {\\small \\textcolor{gray}{${contactLine}}}
\\end{center}
\\vspace{10pt}

\\section{R\\'{e}sum\\'{e} Professionnel}
${summary}

\\section{Parcours Ex\\'{e}cutif}
${experiencesTex}

\\section{Expertises \\& Aptitudes}
\\textbf{Expertises techniques :} ${techSkills} \\\\
\\textbf{Aptitudes comportementales :} ${softSkills}

\\end{document}`;
}

// Minimal/Clean Template
export function generateMinimalTemplate(data: OptimizedResumeResponse, contact: UserContactInfo): string {
  const name = escapeLatex(contact.name);
  const email = escapeLatex(contact.email);
  const phone = contact.phone ? escapeLatex(contact.phone) : '';
  const location = contact.location ? escapeLatex(contact.location) : '';
  const website = contact.website ? escapeLatex(contact.website) : '';

  const contactLine = [phone, email, location, website].filter(Boolean).join('   /   ');

  const summary = escapeLatex(data.profile?.summary);
  const headline = escapeLatex(data.profile?.headline);

  const experiencesTex = (data.experiences || []).map(exp => {
    const role = escapeLatex(exp.role || '');
    const company = escapeLatex(exp.company || '');
    const duration = escapeLatex(exp.duration || '');
    const achievements = (exp.achievements || []).map(ach => `\\item ${escapeLatex(ach)}`).join('\n');

    return `
\\noindent\\textbf{${role}} \\hfill \\textit{${duration}} \\\\
\\noindent\\textcolor{gray}{${company}} \\\\
\\begin{itemize}[leftmargin=12pt, topsep=2pt, itemsep=1.5pt]
${achievements}
\\end{itemize}
\\vspace{4pt}`;
  }).join('\n');

  const techSkills = (data.skills?.technical || []).map(escapeLatex).join(', ');
  const softSkills = (data.skills?.soft || []).map(escapeLatex).join(', ');

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\pagestyle{empty}

\\definecolor{gray}{HTML}{555555}
\\definecolor{lightgray}{HTML}{888888}

\\titleformat{\\section}{\\fontfamily{phv}\\selectfont\\small\\bfseries\\color{gray}\\uppercase}{}{0em}{}
\\titlespacing{\\section}{0pt}{12pt}{4pt}

\\begin{document}

\\begin{flushleft}
    {\\Huge \\fontfamily{phv}\\selectfont \\textbf{${name}}} \\\\
    \\vspace{2pt}
    {\\large \\fontfamily{phv}\\selectfont \\textcolor{gray}{${headline}}} \\\\
    \\vspace{4pt}
    {\\footnotesize \\textcolor{lightgray}{${contactLine}}}
\\end{flushleft}
\\vspace{5pt}

\\section{Introduction}
\\vspace{2pt}
${summary}

\\section{Exp\\'{e}riences}
\\vspace{2pt}
${experiencesTex}

\\section{Comp\\'{e}tences}
\\vspace{2pt}
\\textbf{Techniques :} ${techSkills} \\\\
\\textbf{Comportementales :} ${softSkills}

\\end{document}`;
}

