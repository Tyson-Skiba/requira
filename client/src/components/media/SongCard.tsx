import {
  Card,
  CardMedia,
  Box,
  Typography,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MusicBrainzSearchResult } from '../../../../models/songs/music-brainz'
import { useState } from 'react';

export const SongCard = ({ song }: { song: MusicBrainzSearchResult }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      sx={{
        width: 180,
        position: 'relative',
        overflow: 'hidden',
        cursor: song.downloaded ? 'default' : 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Downloaded Indicator */}
      {song.downloaded && (
        <CheckCircleIcon
          color="primary"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 3,
            bgcolor: 'white',
            borderRadius: '50%',
          }}
        />
      )}

      {/* Album Art */}
      <CardMedia
        component="img"
        height="180"
        image={song.cover!}
      />

      {/* Metadata (always visible) */}
      <Box p={1.5}>
        <Typography fontWeight={500} noWrap>
          {song.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
        >
          {song.artist}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {song.raw.length}
        </Typography>
      </Box>

      {/* Jellyseerr-style Hover Overlay */}
      {!song.downloaded && hovered && (
        <Box
          position="absolute"
          zIndex={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(15, 23, 42, 0.55)" // slate-900 overlay
        >
          <Button
            variant="contained"
            color="primary"
            sx={{
              px: 3,
              fontWeight: 600,
            }}
            onClick={() => {
              console.log('Request song:', song.id);
            }}
          >
            Request
          </Button>
        </Box>
      )}
    </Card>
  );
};
