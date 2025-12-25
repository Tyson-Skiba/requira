import { PagedRequest } from "../../../models/PagedRequest";
import { MusicBrainzSearchResult } from "../../../models/songs/music-brainz";
import { Song } from "../../../models/songs/song";

const search = async (
  title: string,
  artist: string,
): Promise<MusicBrainzSearchResult[]> => {
  // TODO: Generate api??
  const request = await fetch(
    `/api/songs/search?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
  );
  const json = await request.json();

  return json;
};

const queue = async (params: URLSearchParams) => {
  const request = await fetch(`/api/songs/queue?${params.toString()}`);
  return await request.json();
};

const find = async (cursor?: number, searchTerm?: string) => {
  const request = await fetch(
    `/api/songs/?cursor=${cursor}&searchTerm=${searchTerm}`,
  );
  return (await request.json()) as PagedRequest<Song>;
};

export const songApi = {
  search,
  queue,
  find,
};
