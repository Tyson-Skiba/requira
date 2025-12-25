import { Box, Button, Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";

type CoverPickerProps = {
  coverPreview: string | null;
  height: number;
  width: number;
  setCoverFile: (buffer: ArrayBuffer) => void;
  setCoverPreview: (url: string) => void;
};

export const CoverPicker = ({
  width,
  height,
  coverPreview,
  setCoverFile,
  setCoverPreview,
}: CoverPickerProps) => {
  const [open, setOpen] = useState(false);

  const isTouch =
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  const handleUploadCover = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setCoverFile(reader.result as ArrayBuffer);
        setCoverPreview(URL.createObjectURL(file));
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  const handleCoverFromUrl = async () => {
    const url = prompt("Enter image URL");
    if (!url) return;

    const res = await fetch(url);
    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();

    setCoverFile(buffer);
    setCoverPreview(URL.createObjectURL(blob));
  };

  return (
    <>
      <Box
        onClick={() => isTouch && setOpen(true)}
        sx={{
          width,
          height,
          position: "relative",
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          "&:hover .overlay": {
            opacity: isTouch ? 0 : 1,
          },
        }}
      >
        {coverPreview ? (
          <img
            src={coverPreview}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2">No cover</Typography>
          </Box>
        )}

        {!isTouch && (
          <Box
            className="overlay"
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
          >
            <Stack spacing={1}>
              <Button
                variant="outlined"
                size="large"
                sx={{ background: "white" }}
                onClick={handleUploadCover}
              >
                Upload from device
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ background: "white" }}
                onClick={handleCoverFromUrl}
              >
                Get from link
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <Stack spacing={2} p={2}>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(false);
              handleUploadCover();
            }}
          >
            Upload from device
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setOpen(false);
              handleCoverFromUrl();
            }}
          >
            Get from link
          </Button>
        </Stack>
      </Dialog>
    </>
  );
};
