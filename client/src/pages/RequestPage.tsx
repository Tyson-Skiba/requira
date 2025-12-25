import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  TableFooter,
  TablePagination,
} from "@mui/material";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Song } from "../../../models/songs/song";
import { Book } from "../../../models/books/book";

/// This page is wrong, this is more like activity rather then requests

export interface RequestItem {
  id: string;
  title?: string;
  authors?: string;
  publisher?: string;
  year?: string;
  pages?: string;
  language?: string;
  size?: string;
  extension?: string;
  mirror?: string;
  cover?: string;
  data: string;
  type: 1 | 2;
  attempts: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const isSong = (data: any): data is Song => !!(data as Song).artist;
const isBook = (data: any): data is Book => !!(data as Book).authors;

const pickField = <T,>(
  data: string,
  songPicker: (song: Song) => T,
  bookPicker: (book: Book) => T,
  fallback: T,
) => {
  try {
    const item = JSON.parse(data);
    if (isSong(item)) return songPicker(item);
    if (isBook(item)) return bookPicker(item);
    return fallback;
  } catch {
    return fallback;
  }
};

export const RequestPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<RequestItem[]>([]);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/requests/?page=${page + 1}&pageSize=${pageSize}`,
    );
    const data = (await res.json()) as PaginatedResponse<RequestItem>;
    setRows(data.items);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, pageSize]);

  return (
    <DashboardLayout maxWidth="100vw">
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          overflowX: "auto", // horizontal scroll for mobile
          mt: 2,
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Cover</TableCell>
              {!isMobile && <TableCell>Type</TableCell>}
              <TableCell>Title</TableCell>
              <TableCell>Created By</TableCell>
              {!isMobile && <TableCell>Requested</TableCell>}
              <TableCell align="center">Attempts</TableCell>
              {!isMobile && <TableCell>Outcome</TableCell>}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>No requests found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <TableCell>
                    {row.cover && (
                      <img
                        src={row.cover}
                        alt=""
                        style={{
                          width: 40,
                          height: 56,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </TableCell>
                  {!isMobile && (
                    <TableCell>
                      <Chip
                        label={row.type === 2 ? "Book" : "Song"}
                        color="primary"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    {pickField(
                      row.data,
                      (song) => song.title,
                      (book) => book.title ?? "-",
                      "-",
                    )}
                  </TableCell>
                  <TableCell>
                    {pickField(
                      row.data,
                      (song) => song.artist,
                      (book) => book.authors ?? "Unknown",
                      "Unknown",
                    )}
                  </TableCell>
                  {!isMobile && (
                    <TableCell>{new Date(row.data).toLocaleString()}</TableCell>
                  )}
                  <TableCell align="center">{row.attempts}</TableCell>
                  {!isMobile && (
                    <TableCell>
                      <Chip
                        label={row.attempts > 3 ? "Failed" : "Queued"}
                        color={row.attempts > 3 ? "error" : "info"}
                      />
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <Button variant="outlined" size="small">
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20, 50]}
                colSpan={8}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </DashboardLayout>
  );
};
