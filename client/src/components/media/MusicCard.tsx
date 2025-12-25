import { Card, CardMedia, Box, Typography } from '@mui/material';
import { Music } from '../../@types/music';

export const MusicCard = ({ music }: { music: Music }) => (
  <Card sx={{ width: 180 }}>
    <CardMedia
      component="img"
      height="180"
      image={music.coverUrl}
    />
    <Box p={1.5}>
      <Typography fontWeight={500} noWrap>
        {music.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {music.artist}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {music.releaseDate} • {music.runtime}
      </Typography>
    </Box>
  </Card>
);
