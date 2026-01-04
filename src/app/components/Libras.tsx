'use client';
import { useEffect, useState } from 'react';

const Libras = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const scriptId = 'vlibras-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initVLibras = () => {
      const w = window as any;
      if (w.VLibras && typeof w.VLibras.Widget === 'function') {
        new w.VLibras.Widget('https://vlibras.gov.br/app');
      }
    }

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.async = true;
      script.onload = () => {
        // Pequeno delay para garantir que o script carregou no window
        setTimeout(initVLibras, 500);
      };
      document.body.appendChild(script);
    } else {
      initVLibras();
    }

    // Cleanup para evitar duplicação em desenvolvimento (Strict Mode)
    return () => {
      // Opcional: remover elementos injetados pelo VLibras se necessário
    };
  }, []);

  if (!mounted) return null;

  return (
    <div {...({ 'vw': 'true' } as any)} className="enabled">
      <div {...({ 'vw-access-button': 'true' } as any)} className="active" />
      <div {...({ 'vw-plugin-wrapper': 'true' } as any)}>
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
};

export default Libras;