import axios from "axios";
import type {
  ArtistCredit,
  MusicBrainzResponse,
  MusicBrainzSearchResult,
} from "../../models/songs/music-brainz";

export class MusicBrainzProvider {
  search = async (
    title: string,
    artist: string,
  ): Promise<MusicBrainzSearchResult[]> => {
    const url =
      `https://musicbrainz.org/ws/2/recording/?` +
      `query=recording:"${title}" AND artist:"${artist}"&fmt=json&limit=25`;

    const response = await axios.get<MusicBrainzResponse>(url, {
      headers: {
        "User-Agent": "Requira/1.0.0",
      },
      timeout: 8000,
    });

    const recordings = response.data.recordings || [];

    const results = await Promise.all(
      recordings.map(async (rec) => {
        const artistCredit = (rec["artist-credit"]?.[0]?.artist ||
          {}) as ArtistCredit;
        const artistName = artistCredit.name || "Unknown";
        const artistMbid = artistCredit.id || null;

        let album = "Unknown";
        let releaseDate = null;
        let cover = null;

        if (rec.releases?.length) {
          const release = rec.releases[0]!;
          album = release.title;
          releaseDate = release.date || null;

          try {
            const coverRes = await axios.get(
              `https://coverartarchive.org/release/${release.id}/front`,
              { validateStatus: () => true },
            );
            if (coverRes.status === 200) {
              cover = coverRes.request.res.responseUrl;
            }
          } catch {}
        }

        return {
          id: rec.id, // recording MBID
          title: rec.title,
          artist: artistName,
          album,
          releaseDate,
          artistMbid,
          isrc: rec.isrcs?.[0] || null,
          cover,
          raw: rec,
        };
      }),
    );

    return results;
  };
}
