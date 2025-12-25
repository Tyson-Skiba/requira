import { Box, Button, TextField, Typography } from "@mui/material";
import { useSearch } from "../../context/SearchContext";
import { useEffect, useState } from "react";

interface EmptyProps {
  type: "book" | "song";
  onSearch: (title: string, artist: string) => void;
}

export const Empty: React.FC<EmptyProps> = ({ type, onSearch }) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const { searchTerm } = useSearch();

  useEffect(() => {
    setTitle(searchTerm);
  }, [searchTerm]);

  return (
    <Box>
      <Typography
        mb={2}
      >{`No ${type}s found for ${searchTerm}, would you like to download more`}</Typography>
      <Box display="flex" gap={2} mb={3}>
        {type === "song" ? (
          <>
            <TextField
              label="Song Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="standard"
              size="small"
            />
            <TextField
              label="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              variant="standard"
              size="small"
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => onSearch(title, artist)}
            >
              Search
            </Button>
          </>
        ) : null}
        {type === "book" ? (
          <>
            <TextField
              label="Song Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="standard"
              size="small"
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => onSearch(title, artist)}
            >
              Search
            </Button>
          </>
        ) : null}
      </Box>
    </Box>
  );
};
