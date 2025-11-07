'use client'

// Client-side helper to generate a PDF from an HTMLElement using html2canvas + jsPDF.
// This file dynamically imports the libraries to avoid SSR/packaging issues.

export type GeneratePdfOptions = {
  fileName?: string;
  scale?: number; // canvas scale multiplier
  marginMm?: number; // margin in mm
};

export default async function generatePdfFromElement(el: HTMLElement | null, opts: GeneratePdfOptions = {}) {
  if (!el) throw new Error('No element provided to generatePdfFromElement');
  const { fileName = 'document.pdf', scale = 2, marginMm = 5 } = opts;

  // Dynamic imports
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);
  // Ensure fonts are loaded
  try { if ((document as any).fonts) await (document as any).fonts.ready; } catch (e) { /* ignore */ }

  // Helper: inline external images (convert to data URLs) so html2canvas captures them reliably
  async function inlineExternalImages(root: HTMLElement) {
    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    const originals: { img: HTMLImageElement; src: string }[] = [];

    await Promise.all(imgs.map(async (img) => {
      if (!img.src) return;
      // skip if already data URL
      if (img.src.startsWith('data:')) return;
      originals.push({ img, src: img.src });
      try {
        // try fetching image as blob (CORS required on remote host)
        const resp = await fetch(img.src, { mode: 'cors' });
        if (!resp.ok) throw new Error('fetch failed');
        const blob = await resp.blob();
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        // fallback: try to set crossOrigin and wait for load
        try {
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        } catch (err) {
          // ignore
        }
      }
    }));

    return originals;
  }

  // Helper: temporarily set overflow: visible on ancestors to avoid cropping
  function relaxOverflowForCapture(node: HTMLElement) {
    const changed: { el: HTMLElement; prev: string | null }[] = [];
    let cur: HTMLElement | null = node;
    while (cur && cur !== document.documentElement && cur !== document.body) {
      const prev = cur.style.overflow;
      if (prev !== 'visible') {
        changed.push({ el: cur, prev });
        cur.style.overflow = 'visible';
      }
      cur = cur.parentElement;
    }
    // also ensure body/html
    const bodyPrev = document.body.style.overflow;
    if (bodyPrev !== 'visible') {
      changed.push({ el: document.body, prev: bodyPrev });
      document.body.style.overflow = 'visible';
    }
    return changed;
  }

  // Prepare images and overflow
  const originals = await inlineExternalImages(el);
  const changedOverflow = relaxOverflowForCapture(el);

  // Render element to canvas
  const canvas = await html2canvas(el, { scale, useCORS: true, backgroundColor: '#ffffff' });

  // restore originals
  try {
    originals.forEach(o => { o.img.src = o.src; });
  } catch (e) { /* ignore */ }
  try {
    changedOverflow.forEach(c => { if (c.prev !== null) c.el.style.overflow = c.prev; else c.el.style.removeProperty('overflow'); });
  } catch (e) { /* ignore */ }
  const imgData = canvas.toDataURL('image/png');

  // Calculate PDF size and orientation
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Convert canvas pixel size to mm (1px = 0.264583 mm at 96dpi). Use canvas.width / scale to get CSS px width.
  const pxToMm = (px: number) => px * 0.264583;
  const imgWidthMm = pxToMm(canvas.width) / (scale / 1);
  const imgHeightMm = pxToMm(canvas.height) / (scale / 1);

  const margin = marginMm;
  const usableWidth = pdfWidth - margin * 2;
  const usableHeight = pdfHeight - margin * 2;

  // Scale image down to fit PDF width if necessary
  const ratio = Math.min(usableWidth / imgWidthMm, usableHeight / imgHeightMm, 1);
  const renderWidth = imgWidthMm * ratio;
  const renderHeight = imgHeightMm * ratio;

  // If the content fits on a single page, add it. Otherwise, split vertically.
  if (renderHeight <= usableHeight) {
    pdf.addImage(imgData, 'PNG', margin, margin, renderWidth, renderHeight);
    pdf.save(fileName);
    return;
  }

  // Multi-page: slice the canvas vertically
  const pageCanvas = document.createElement('canvas');
  const pageCtx = pageCanvas.getContext('2d');
  if (!pageCtx) throw new Error('Failed to create canvas context');

  // Determine scaled pixel height per PDF page
  const scaleFactor = (renderWidth / imgWidthMm) * (96 / 25.4); // approximate conversion back to px; we can compute a simpler method
  // Simpler approach: compute portion of original canvas that corresponds to usableHeight
  const portionHeightPx = Math.floor((usableHeight / imgHeightMm) * canvas.height);
  pageCanvas.width = canvas.width;
  pageCanvas.height = portionHeightPx;

  let y = 0;
  let pageIndex = 0;
  while (y < canvas.height) {
    pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageCtx.drawImage(canvas, 0, y, canvas.width, portionHeightPx, 0, 0, pageCanvas.width, pageCanvas.height);
    const pageImgData = pageCanvas.toDataURL('image/png');

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(pageImgData, 'PNG', margin, margin, renderWidth, renderHeight > usableHeight ? usableHeight : renderHeight);

    y += portionHeightPx;
    pageIndex += 1;
  }

  pdf.save(fileName);
}
