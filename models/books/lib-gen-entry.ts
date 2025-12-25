export interface LibGenEntry {
  id: string;
  authors: string;
  title: string;
  publisher: string;
  year: string;
  pages: string;
  language: string;
  size: string;
  extension: string;
  mirror: string;
  cover: string;
  queued?: boolean;
  failed?: boolean;
  downloaded?: boolean;
}
