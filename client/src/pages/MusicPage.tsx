import { Box, TextField, Button, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { songApi } from "../api/songs";
import { Song } from "../../../models/songs/song";
import { SongCard } from "../components/media/SongCard";
import { MusicBrainzSearchResult } from "../../../models/songs/music-brainz";
import { MediaGrid } from "../components/media/MediaGrid";
import { MediaCardProps } from "../components/media/MediaCard";

const fallback =
  "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png";

const createDataMapper =
  (updater: Dispatch<SetStateAction<MediaCardProps[]>>) =>
  (record: MusicBrainzSearchResult): MediaCardProps => {
    let status: MediaCardProps["status"] = "none";
    if (record.queued) status = "queued";
    if (record.failed) status = "failed";
    if (record.downloaded) status = "downloaded";

    return {
      id: record.id,
      title: record.title,
      subtitle: record.artist,
      cover: record.cover ?? fallback,
      status,
      aspectRatio: "1 / 1",
      onClick: () => {
        if (status === "queued") {
          console.log("open queue");
          return;
        }

        if (status === "failed") {
          console.log("open logs");
          return;
        }

        if (status === "downloaded") {
          console.log("open metadat editor");
          return;
        }
        songApi.queue(
          new URLSearchParams({
            query: `${record.title} ${record.artist}`,
            mbid: record.id,
            title: record.title,
            artist: record.artist,
            album: record.album || "",
            releaseDate: record.releaseDate || "",
            artistMbid: record.artistMbid || "",
            isrc: record.isrc || "",
            cover: record.cover || "",
          }),
        );

        updater((results) =>
          results.map((item) => {
            if (item.id !== record.id) return item;

            item.status = "queued";

            return item;
          }),
        );
      },
    };
  };

export const createSongItem = (id: string): MediaCardProps => ({
  id,
  cover: "",
  title: "",
  subtitle: "",
  aspectRatio: "1 / 1",
  status: "none",
  isLoading: true,
  onClick: () => null,
});

export const MusicPage = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [results, setResults] = useState<MediaCardProps[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!title && !artist) return;
    setResults([createSongItem("1"), createSongItem("2"), createSongItem("3")]);
    setSearched(true);
    const data = await songApi.search(title, artist);
    const dataMapper = createDataMapper(setResults);
    const music = data.map(dataMapper);
    setResults(music);
  };

  return (
    <DashboardLayout>
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {!searched && (
        <Typography color="text.secondary">
          Search for a song to see results.
        </Typography>
      )}

      {results.length ? <MediaGrid items={results} /> : null}
    </DashboardLayout>
  );
};
