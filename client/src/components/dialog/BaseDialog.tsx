import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  SwipeableDrawer,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";

interface BaseDialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const pullHandle = (
  <Box
    sx={{
      width: 40,
      height: 4,
      bgcolor: "divider",
      borderRadius: 2,
      mx: "auto",
      my: 1.5,
    }}
  />
);

export const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  title,
  children,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              height: "90dvh",
            },
          },
        }}
      >
        {pullHandle}

        <Box
          overflow="auto"
          sx={{
            px: 2,
            pt: 1,
            pb: "calc(64px + env(safe-area-inset-bottom) + 16px)",
          }}
        >
          {children}
        </Box>
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="detail-title"
    >
      <DialogTitle id="detail-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText minWidth="400px">{children}</DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
