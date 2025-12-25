import { Box, Button, Card } from "@mui/material";
import { MediaCard, MediaCardProps } from "./MediaCard";
import { JSX } from "react";

interface Props {
  items: MediaCardProps[];
  empty?: JSX.Element;
  loadMore?: () => void;
}

export const MediaGrid: React.FC<Props> = ({ items, empty, loadMore }) => {
  if (!items.length && empty) return empty;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(6, 1fr)",
          xl: "repeat(8, 1fr)",
          "2xl": "repeat(10, 1fr)", // optional custom breakpoint
        },
      }}
    >
      {items.map((item) => (
        <MediaCard key={item.id} {...item} />
      ))}
      {loadMore ? (
        <Card sx={{ height: "100%" }}>
          <Button
            onClick={loadMore}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            Load More
          </Button>
        </Card>
      ) : null}
    </Box>
  );
};
