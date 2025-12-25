import { Box, Button, TextField, Typography } from "@mui/material";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MediaCardProps } from "../media/MediaCard";
import { bookApi } from "../../api/books";
import { MediaGrid } from "../media/MediaGrid";
import { LibGenEntry } from "../../../../models/books/lib-gen-entry";
import { BaseDialog } from "./BaseDialog";

interface AddBookDialogProps {
  open: boolean;
  titleTerm?: string;
  onClose?: () => void;
}

const fallback =
  "https://i.pinimg.com/736x/d0/33/4a/d0334a44ed954856d152fd00a85af4dc.jpg";

const createDataMapper =
  (updater: Dispatch<SetStateAction<MediaCardProps[]>>) =>
  (record: LibGenEntry): MediaCardProps => {
    let status: MediaCardProps["status"] = "none";
    if (record.queued) status = "queued";
    if (record.failed) status = "failed";
    if (record.downloaded) status = "downloaded";

    return {
      id: record.id,
      title: record.title ?? "Unknown",
      subtitle: record.authors,
      cover: record.cover?.replace("_small", "") ?? fallback,
      status,
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

        bookApi.queue(
          new URLSearchParams({
            id: record.id,
            authors: record.authors,
            publisher: record.publisher,
            year: record.year,
            pages: record.pages,
            language: record.language,
            size: record.size,
            extension: record.extension,
            mirror: record.mirror,
            cover: record.cover,
            title: record.title,
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

export const createBookItem = (id: string): MediaCardProps => ({
  id,
  cover: "",
  title: "",
  subtitle: "",
  status: "none",
  isLoading: true,
  onClick: () => null,
});

export const AddBookDialog: React.FC<AddBookDialogProps> = ({
  open,
  titleTerm = "",
  onClose,
}) => {
  const [term, setTerm] = useState(titleTerm);
  const [results, setResults] = useState<MediaCardProps[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!term) return;
    setResults([createBookItem("1"), createBookItem("2"), createBookItem("3")]);
    setSearched(true);
    const data = await bookApi.search(term);
    const dataMapper = createDataMapper(setResults);
    const books = data.map(dataMapper);
    setResults(books);
  };

  useEffect(() => {
    setTerm(titleTerm);
  }, [titleTerm]);

  return (
    <BaseDialog title="Add book" open={open} onClose={onClose ?? (() => null)}>
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {!searched && (
        <Typography color="text.secondary">
          Search for a book to see results.
        </Typography>
      )}

      {results.length ? <MediaGrid items={results} /> : null}
    </BaseDialog>
  );
};
