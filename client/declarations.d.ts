/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REQUIRA_BOOK_DOWNLOAD_LOCATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
