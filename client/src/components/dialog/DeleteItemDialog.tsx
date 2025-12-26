import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  itemName?: string;
  onCancel: () => void;
  onConfirm: (remove: boolean, avoid: boolean) => void;
  loading?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title,
  itemName,
  onCancel,
  onConfirm,
  loading = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [removeData, setRemoveData] = useState(false);
  const [avoidRelease, setAvoidRelease] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        <Stack direction="row" spacing={1.5} alignItems="center">
          {title}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography id="delete-dialog-description" mb={1}>
          Please select what you would like to remove
        </Typography>

        <Stack spacing={1}>
          <FormControlLabel
            control={<Checkbox checked disabled color="error" />}
            label={
              <Typography>
                <strong>Remove from library</strong>
                <br />
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  This will remove the item from the user interface
                </Typography>
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={removeData}
                onChange={(e) => setRemoveData(e.target.checked)}
                color="error"
              />
            }
            label={
              <Typography>
                <strong>Remove data</strong>
                <br />
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  This will also remove the saved file from your disk
                </Typography>
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={avoidRelease}
                onChange={(e) => setAvoidRelease(e.target.checked)}
              />
            }
            label={
              <Typography>
                <strong>Avoid release</strong>
                <br />
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  Prevent this exact version from appearing in future searches
                </Typography>
              </Typography>
            }
          />
        </Stack>

        <Typography id="delete-dialog-description" mt={4}>
          This action cannot be undone.
        </Typography>

        {itemName && (
          <Typography mt={1} fontWeight={600} color="text.primary">
            {itemName}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm(removeData, avoidRelease);
            onCancel();
          }}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
