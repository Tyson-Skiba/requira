export interface MusicBrainzResponse {
  created: string; // ISO timestamp
  count: number;
  offset: number;
  recordings: Recording[];
}

export interface Recording {
  id: string; // Recording MBID
  score: number;
  "artist-credit-id"?: string;
  title: string;
  length?: number; // in ms
  video?: boolean | null;
  "artist-credit": ArtistCredit[];
  "first-release-date"?: string;
  releases?: Release[];
  tags?: Tag[];
  isrcs?: string[];
}

export interface ArtistCredit {
  id: string;
  name: string;
  artist: {
    id: string;
    name: string;
    "sort-name": string;
    disambiguation?: string;
  };
}

export interface Release {
  id: string;
  title: string;
  status?: string;
  "status-id"?: string;
  count?: number;
  date?: string;
  country?: string;
  "release-group": ReleaseGroup;
  "release-events"?: ReleaseEvent[];
  "track-count"?: number;
  media?: Media[];
}

export interface ReleaseGroup {
  id: string;
  title: string;
  "type-id"?: string;
  "primary-type-id"?: string;
  "primary-type"?: string;
}

export interface ReleaseEvent {
  date?: string;
  area?: {
    id: string;
    name: string;
    "sort-name": string;
    "iso-3166-1-codes"?: string[];
  };
}

export interface Media {
  id: string;
  position: number;
  format?: string;
  track?: Track[];
  "track-count"?: number;
  "track-offset"?: number;
}

export interface Track {
  id: string;
  number: string;
  title: string;
  length?: number;
}

export interface Tag {
  count: number;
  name: string;
}

export interface MusicBrainzSearchResult {
  id: string; // Recording MBID
  title: string; // Recording title
  artist: string; // Artist name (resolved from artist-credit)
  album: string; // First release title or "Unknown"
  releaseDate: string | null; // Release date if available
  artistMbid: string | null; // Artist MBID if available
  isrc: string | null; // First ISRC code if available
  cover: string | null; // URL to cover art if found
  raw: Recording; // Full raw Recording object from MusicBrainz
  downloaded?: boolean;
  queued?: boolean;
  failed?: boolean;
}
