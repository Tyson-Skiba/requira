export interface Book {
  id: number;
  external_id: string;
  authors: string | null;
  title: string | null;
  publisher: string | null;
  year: number | null;
  pages: number | null;
  language: string | null;
  size: string | null;
  extension: string | null;
  mirror: string | null;
  cover: string | null;
  cache_key: string;
}
