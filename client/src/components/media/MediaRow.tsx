import { Box, Typography } from "@mui/material";
import { Media } from "../../@types/media";
import { MediaCard, MediaCardProps } from "./MediaCard";

interface Props {
  title: string;
  items: MediaCardProps[];
}

export const MediaRow = ({ title, items }: Props) => (
  <Box mb={4}>
    <Typography variant="h6" mb={2}>
      {title}
    </Typography>
    <Box display="flex" gap={2} overflow="auto">
      {items.map((item) => (
        <MediaCard key={item.id} {...item} />
      ))}
    </Box>
  </Box>
);
