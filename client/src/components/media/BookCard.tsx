import { Card, CardMedia, Box, Typography } from '@mui/material';
import { Book } from '../../@types/book';

export const BookCard = ({ book }: { book: Book }) => (
  <Card sx={{ width: 160 }}>
    <CardMedia
      component="img"
      height="220"
      image={book.coverUrl}
    />
    <Box p={1.5}>
      <Typography fontWeight={500} noWrap>
        {book.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {book.author}
      </Typography>
      {book.series && (
        <Typography variant="caption" color="text.secondary">
          {book.series}
        </Typography>
      )}
    </Box>
  </Card>
);
