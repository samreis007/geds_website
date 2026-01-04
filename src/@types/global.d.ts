export {}; // <- deve vir antes do declare global ou fora dele

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => {
        init: () => void; // Você pode adicionar mais métodos conforme precisar
      };
    };
  }
}