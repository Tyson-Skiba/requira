export interface Song {
  id: number;
  recording_mbid: string | null;
  artist_mbid: string | null;
  title: string;
  artist: string;
  album: string | null;
  release_date: Date | null;
  isrc: string | null;
  cover: string | null;
  filepath: string;
  external_id: string;
  created_at: Date;
  cache_key: string;
}
