import React from 'react';
import { Typography, Paper, Box, TextField, Button } from '@mui/material';

export const Settings: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="API Key" variant="outlined" fullWidth />
        <TextField label="Server URL" variant="outlined" fullWidth />
        <Button variant="contained" color="primary">
          Save
        </Button>
      </Box>
    </Paper>
  );
};
