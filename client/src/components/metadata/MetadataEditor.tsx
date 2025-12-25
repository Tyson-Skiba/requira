import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Input,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CoverPicker } from "./CoverPicker";

type BookMetadata = {
  title: string;
  author: string;
  language: string;
  isbn: string;
  series: string;
  seriesIndex: string;
};

type MusicMetadata = {
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  track: string;
  disc: string;
  year: string;
  genre: string;
  recordingId: string;
};

type Metadata = BookMetadata | MusicMetadata;

interface MetadataEditorProps {
  id: number;
  type: "book" | "song";
  onSave?: () => void;
}

const isSong = (metadata: Metadata): metadata is MusicMetadata =>
  !!(metadata as MusicMetadata).artist;

const emptyBookMetadata = {
  title: "",
  author: "",
  language: "",
  isbn: "",
  series: "",
  seriesIndex: "",
};

const emptySongMetadata = {
  title: "",
  artist: "",
  album: "",
  albumArtist: "",
  track: "",
  disc: "",
  year: "",
  genre: "",
  recordingId: "",
};

const inputProps = (v: string) => ({
  InputLabelProps: { shrink: Boolean(v) },
});

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  id,
  type,
  onSave,
}) => {
  const [data, setData] = useState<Metadata>(
    type === "book" ? emptyBookMetadata : emptySongMetadata,
  );

  const [coverFile, setCoverFile] = useState<ArrayBuffer | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`/api/metadata/${id}/${type}`).then((r) => setData(r.data));
    fetchCoverPreview();
  }, [id]);

  const fetchCoverPreview = async () => {
    try {
      const res = await axios.get(`/api/metadata/${id}/${type}/cover`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      setCoverPreview(url);
    } catch {
      setCoverPreview(null);
    }
  };

  const autofill = async () => {
    if (isSong(data)) {
      const r = await axios.get(
        `/api/metadata/recording_id/${data.recordingId}`,
      );
      setData((d) => ({ ...d, ...r.data }));
    } else {
      const r = await axios.get(`/api/metadata/isbn/${data.isbn}`);
      setData((d) => ({ ...d, ...r.data }));
    }
  };

  const save = async () => {
    const form = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });

    if (coverFile) {
      form.append("cover", new Blob([coverFile]), "cover.jpg");
    }

    await axios.post(`/api/metadata/${id}/${type}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (onSave) onSave();
  };

  const handleCoverClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setCoverFile(reader.result as ArrayBuffer);
        setCoverPreview(URL.createObjectURL(file));
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  if (isSong(data))
    return (
      <Box maxWidth={800} mx="auto">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "center", md: "flex-start" }}
          >
            {/*<Paper
              variant="outlined"
              onClick={handleCoverClick}
              sx={{
                width: 204,
                height: 204,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Typography variant="body2">Click to upload</Typography>
              )}
            </Paper>*/}

            <CoverPicker
              width={204}
              height={204}
              coverPreview={coverPreview}
              setCoverFile={setCoverFile}
              setCoverPreview={setCoverPreview}
            />

            <Stack spacing={2} flex={1} width="100%">
              <TextField
                label="Title"
                value={data.title}
                {...inputProps(data.artist)}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Artist"
                value={data.artist}
                {...inputProps(data.artist)}
                onChange={(e) => setData({ ...data, artist: e.target.value })}
                fullWidth
              />
              <TextField
                label="Year"
                value={data.year}
                {...inputProps(data.artist)}
                onChange={(e) => setData({ ...data, year: e.target.value })}
                fullWidth
              />
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <TextField
              label="Album"
              value={data.album}
              {...inputProps(data.artist)}
              onChange={(e) => setData({ ...data, album: e.target.value })}
              fullWidth
            />
            <TextField
              label="Album Artist"
              value={data.albumArtist}
              {...inputProps(data.artist)}
              onChange={(e) =>
                setData({
                  ...data,
                  albumArtist: e.target.value,
                })
              }
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Track #"
                value={data.track}
                {...inputProps(data.artist)}
                onChange={(e) => setData({ ...data, track: e.target.value })}
                fullWidth
              />
              <TextField
                label="Disc #"
                value={data.disc}
                {...inputProps(data.artist)}
                onChange={(e) => setData({ ...data, disc: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Genre"
                value={data.genre}
                {...inputProps(data.artist)}
                onChange={(e) => setData({ ...data, genre: e.target.value })}
                fullWidth
              />
              <TextField
                label="MusicBrainz Recording Id"
                value={data.recordingId}
                {...inputProps(data.artist)}
                onChange={(e) => setData({ ...data, genre: e.target.value })}
                fullWidth
              />
            </Stack>
            <Button
              variant="outlined"
              disabled={!data.recordingId}
              onClick={autofill}
            >
              Autofill from MusicBrainz
            </Button>

            <Button variant="contained" onClick={save}>
              Save
            </Button>
          </Stack>
        </Stack>
      </Box>
    );

  return (
    <Box mx="auto">
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        my={2}
        alignItems={{ xs: "center", md: "flex-start" }}
      >
        {/*<Paper
          variant="outlined"
          sx={{
            width: 300,
            height: 440,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          onClick={handleCoverClick}
        >
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Cover Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Click to upload
            </Typography>
          )}
        </Paper> */}
        <CoverPicker
          width={300}
          height={440}
          coverPreview={coverPreview}
          setCoverFile={setCoverFile}
          setCoverPreview={setCoverPreview}
        />

        <Stack spacing={2} flex={1} width="100%">
          <TextField
            label="Title"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
          <TextField
            label="Author"
            value={data.author}
            onChange={(e) => setData({ ...data, author: e.target.value })}
          />
          <TextField
            label="Series"
            value={data.series}
            onChange={(e) => setData({ ...data, series: e.target.value })}
          />
          <TextField
            label="Series Index"
            type="number"
            value={data.seriesIndex}
            onChange={(e) => setData({ ...data, seriesIndex: e.target.value })}
          />
          <TextField
            label="ISBN"
            value={data.isbn}
            onChange={(e) => setData({ ...data, isbn: e.target.value })}
          />

          <Button variant="outlined" onClick={autofill} disabled={!data.isbn}>
            Autofill from ISBN
          </Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
