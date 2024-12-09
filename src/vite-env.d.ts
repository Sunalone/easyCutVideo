/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<typeof DefineComponent>;
  export default component;
}

interface Window {
  electronAPI: {
    openFileDialog: () => void;
    onFileDialogResult: (
      callback: (event: any, directoryPath: string) => void
    ) => void;
    editVideo: (videoList: any) => void;
    test: () => void;
    onSetLoading: (callback: (event: any, isLoading: boolean) => void) => void;
  };
}
