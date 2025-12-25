import { DashboardLayout } from "../components/layout/DashboardLayout";
import { MediaRow } from "../components/media/MediaRow";
import { Media } from "../@types/media";
import { MediaCardProps } from "../components/media/MediaCard";
import { MediaGrid } from "../components/media/MediaGrid";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  EllipsisVerticalIcon,
  FolderArrowDownIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Legend } from "../components/media/Legend";
import { useEffect, useState } from "react";
import { createSongItem } from "./MusicPage";
import { createBookItem } from "./BookPage";
import { songApi } from "../api/songs";
import { bookApi } from "../api/books";
import { MetadataEditor } from "../components/metadata/MetadataEditor";
import { DeleteConfirmDialog } from "../components/dialog/DeleteItemDialog";
import { useSearch } from "../context/SearchContext";
import { Empty } from "../components/media/Empty";
import { MetadataDialog } from "../components/dialog/MetadataDialog";
import { AddSongDialog } from "../components/dialog/AddSongDialog";
import { AddBookDialog } from "../components/dialog/AddBookDialog";

interface SeletectItem {
  id: number;
  title: string;
  type: "book" | "song";
}

export const DashboardPage = () => {
  const theme = useTheme();
  const { searchTerm } = useSearch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [songCursor, setSongCursor] = useState<number>();
  const [bookCursor, setbookCursor] = useState<number>();
  const [songOpen, setSongOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SeletectItem | undefined>();
  const [addTerms, setAddTerms] = useState<{ title: string; artist: string }>({
    title: "",
    artist: "",
  });

  const [songs, setSongs] = useState<MediaCardProps[]>([
    createSongItem("1"),
    createSongItem("2"),
    createSongItem("3"),
  ]);

  const [books, setBooks] = useState<MediaCardProps[]>([
    createBookItem("1"),
    createBookItem("2"),
    createBookItem("3"),
  ]);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const openMenu =
    (item: SeletectItem) => (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setMenuAnchorEl(event.currentTarget);
      setSelectedItem(item);
    };

  const loadSongs = async (cursor?: number) => {
    const { items: recentSongs, nextCursor } = await songApi.find(
      cursor,
      searchTerm,
    );
    const mapped = recentSongs.map(
      (song): MediaCardProps => ({
        id: song.id.toString(),
        title: song.title,
        subtitle: song.artist,
        cover: `/api/metadata/${song.id}/song/cover?${song.cache_key}`,
        status: "downloaded",
        aspectRatio: "1 / 1",
        openMenu: openMenu({
          id: song.id,
          title: song.title,
          type: "song",
        }),
        onClick: () => {
          setSelectedItem({
            title: song.title,
            id: song.id,
            type: "song",
          });
        },
      }),
    );

    setSongCursor(nextCursor);
    setSongs(cursor ? (current) => [...current, ...mapped] : [...mapped]);
  };

  const loadBooks = async (cursor?: number) => {
    console.log(searchTerm);
    const { items: recentBooks, nextCursor } = await bookApi.find(
      cursor,
      searchTerm,
    );
    const mapped = recentBooks.map(
      (book): MediaCardProps => ({
        id: book.id.toString(),
        title: book.title!,
        subtitle: book.authors ?? "Unknown",
        cover: `/api/metadata/${book.id}/book/cover?${book.cache_key}`,
        status: "downloaded",
        openMenu: openMenu({
          id: book.id,
          title: book.title!,
          type: "book",
        }),
        onClick: () => {
          setSelectedItem({
            title: book.title! + book.id,
            id: book.id,
            type: "book",
          });
        },
      }),
    );

    setbookCursor(nextCursor);
    setBooks(cursor ? (current) => [...current, ...mapped] : [...mapped]);
  };

  useEffect(() => {
    loadSongs();
    loadBooks();
  }, [searchTerm]);

  return (
    <DashboardLayout>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Songs</Typography>
        <Button
          size={isMobile ? "small" : "medium"}
          variant="outlined"
          sx={{ whiteSpace: "nowrap", height: 36 }}
          onClick={() => setSongOpen(true)}
        >
          <PlusIcon height={18} width={18} style={{ marginRight: "0.5rem" }} />
          Add Songs
        </Button>
      </Box>
      <MediaGrid
        items={songs}
        empty={
          <Empty
            type="song"
            onSearch={(title, artist) => {
              setAddTerms({ title, artist });
              setSongOpen(true);
            }}
          />
        }
        loadMore={songCursor ? () => loadSongs(songCursor) : undefined}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        mt={4}
      >
        <Typography variant="h4">Books</Typography>
        <Button
          size={isMobile ? "small" : "medium"}
          variant="outlined"
          sx={{ whiteSpace: "nowrap", height: 36 }}
          onClick={() => setBookOpen(true)}
        >
          <PlusIcon height={18} width={18} style={{ marginRight: "0.5rem" }} />
          Add Books
        </Button>
      </Box>
      <MediaGrid
        items={books}
        empty={
          <Empty
            type="book"
            onSearch={(title, artist) => {
              setAddTerms({ title, artist });
              setBookOpen(true);
            }}
          />
        }
        loadMore={bookCursor ? () => loadBooks(bookCursor) : undefined}
      />
      <Legend />
      <MetadataDialog
        fullScreen={isMobile}
        open={metadataOpen}
        selectedItem={selectedItem}
        onClose={() => setMetadataOpen(false)}
        onSave={async () => {
          if (selectedItem?.type === "book") await loadBooks();
          else await loadSongs();

          setMetadataOpen(false);
        }}
      />
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null);
          setSelectedItem(undefined);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            setMetadataOpen(true);
          }}
        >
          <PencilIcon height={16} style={{ marginRight: "0.5rem" }} />
          Edit metadata
        </MenuItem>
        <MenuItem>
          <FolderArrowDownIcon height={16} style={{ marginRight: "0.5rem" }} />
          Download
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            setDeleteOpen(true);
          }}
          sx={{ color: (theme) => theme.palette.error.main }}
        >
          <TrashIcon height={16} style={{ marginRight: "0.5rem" }} />
          Delete
        </MenuItem>
      </Menu>
      <AddSongDialog
        artistTerm={addTerms.artist}
        titleTerm={addTerms.title}
        onClose={() => {
          setSongOpen(false);
          setAddTerms({ title: "", artist: "" });
        }}
        open={songOpen}
      />
      <AddBookDialog
        titleTerm={addTerms.title}
        onClose={() => {
          setBookOpen(false);
          setAddTerms({ title: "", artist: "" });
        }}
        open={bookOpen}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        title={`Delete ${selectedItem?.type}`}
        itemName={selectedItem?.title}
        onConfirm={async (remove, avoid) => {
          if (selectedItem?.type === "book") {
            await fetch(
              `/api/books/${selectedItem?.id}/remove?remove=${remove}&avoid=${avoid}`,
              {
                method: "DELETE",
              },
            );

            await loadBooks();

            setDeleteOpen(false);
          } else if (selectedItem?.type === "song") {
            await fetch(
              `/api/songs/${selectedItem?.id}/remove?remove=${remove}&avoid=${avoid}`,
              {
                method: "DELETE",
              },
            );

            await loadBooks();
            await loadSongs();
          }
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </DashboardLayout>
  );
};
