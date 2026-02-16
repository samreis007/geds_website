'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import Script from 'next/script';

const Libras = () => {
  useEffect(() => {
    const initVLibras = () => {
      const w = window as any;
      if (w.VLibras && typeof w.VLibras.Widget === 'function') {
        // Verificamos se o VLibras já injetou o conteúdo. 
        // Se a div 'vw-plugin-wrapper' estiver vazia (só com a div top), inicializamos.
        const wrapper = document.querySelector('[vw-plugin-wrapper]');
        if (wrapper && wrapper.children.length <= 1) {
          try {
            new w.VLibras.Widget('https://vlibras.gov.br/app');
          } catch (e) {
            // Ignora erro se já estiver inicializado
          }
        }
      }
    };

    // Fica checando a cada 1 segundo se o bonequinho está lá. 
    // Se sumir (no F5 ou troca de página), ele coloca de novo.
    const interval = setInterval(initVLibras, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Script
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="afterInteractive"
        onLoad={() => {
          const w = window as any;
          if (w.VLibras && typeof w.VLibras.Widget === 'function') {
            try {
              new w.VLibras.Widget('https://vlibras.gov.br/app');
            } catch (e) { }
          }
        }}
      />
      <div {...({ 'vw': 'true' } as any)} className="enabled">
        <div {...({ 'vw-access-button': 'true' } as any)} className="active" />
        <div {...({ 'vw-plugin-wrapper': 'true' } as any)}>
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>
    </>
  );
};

export default Libras;
