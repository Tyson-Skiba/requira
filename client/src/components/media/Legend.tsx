import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassCircleIcon,
  PlusCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Box, Typography } from "@mui/material";

export const Legend: React.FC = () => {
  return (
    <Box
      color={(theme) => theme.palette.action.active}
      mt={2}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant="caption" display="flex">
        <PlusCircleIcon height={16} style={{ margin: "2px 0.5rem 0 1rem" }} />
        Click to download&nbsp;
        <EnvelopeIcon height={16} style={{ margin: "2px 0.5rem 0 1rem" }} />
        Waiting for approval&nbsp;
        <CheckCircleIcon height={16} style={{ margin: "2px 0.5rem 0 1rem" }} />
        Download complete&nbsp;
        <ExclamationTriangleIcon
          height={16}
          style={{ margin: "2px 0.5rem 0 1rem" }}
        />
        Download failed
      </Typography>
    </Box>
  );
};
