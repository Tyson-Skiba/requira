import { Box } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav } from "./BottomNav";

interface Props {
  children: React.ReactNode;
  maxWidth?: string;
  hideTopbar?: boolean;
}

export const DashboardLayout: React.FC<Props> = ({
  maxWidth,
  hideTopbar,
  children,
}) => (
  <Box display="flex" height="100dvh" overflow="hidden">
    <Sidebar />

    <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
      {!hideTopbar ? <Topbar /> : null}

      <Box
        flex={1}
        minHeight={0}
        overflow="auto"
        maxWidth={maxWidth}
        sx={{
          px: { xs: 2, md: 3 },
          pt: { xs: 2, md: 3 },
          pb: {
            xs: `calc(64px + env(safe-area-inset-bottom))`,
            md: 3,
          },
        }}
      >
        {children}
      </Box>
    </Box>

    <MobileBottomNav />
  </Box>
);
