'use client'
import React from 'react';
import SidebarBtn from './dashboardSidebarBtn';

type Props = { targetRef: React.RefObject<HTMLElement>, title?: string };

export default function PrintButton({ targetRef, title = 'Print Now' }: Props) {
  // simple lock to avoid duplicate prints
  let isPrinting = false;

  function iframePrint(htmlString: string) {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        try { document.body.removeChild(iframe); } catch (e) { /* ignore */ }
        return;
      }

      doc.open();
      doc.write(htmlString);
      doc.close();

      const win = iframe.contentWindow;

      const cleanup = () => {
        try {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        } catch (e) { /* ignore */ }
        isPrinting = false;
      };

      const doPrint = () => {
        try {
          win?.focus();
          try {
            // when available, cleanup after printing
            (win as any).onafterprint = cleanup;
          } catch (e) { /* ignore */ }
          win?.print();
        } catch (e) {
          cleanup();
        }
      };

      if (doc.readyState === 'complete') {
        setTimeout(doPrint, 50);
      } else {
        iframe.onload = () => { setTimeout(doPrint, 50); };
        // backup
        setTimeout(doPrint, 1000);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Print failed', e);
      isPrinting = false;
    }
  }

  const handlePrint = () => {
    if (isPrinting) return;
    if (!targetRef?.current) return;
    isPrinting = true;

    const el = targetRef.current;
    const headHTML = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]')).map(n => n.outerHTML).join('');
  const printStyles = `<style>@page{ margin:10mm; }html,body{ width: 1048px; margin:0; padding:0;}</style>`;
  const wrappedBody = `<div>${el.outerHTML}</div>`;
  const html = `<!doctype html><html><head>${printStyles}${headHTML}<title>${title}</title></head><body>${wrappedBody}</body></html>`;

    // always use iframe based printing for reliability
    iframePrint(html);
  };

  return (
    <SidebarBtn
      isActive
      leadingIcon={"lucide:printer"}
      leadingIconSize={20}
      label={title}
      onClick={handlePrint}
    />
  );
}