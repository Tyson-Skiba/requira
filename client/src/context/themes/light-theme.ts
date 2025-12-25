import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#9333ea", // tailwind purple-600
      light: "#c084fc",
      dark: "#7e22ce",
    },

    background: {
      default: "#f8fafc", // slate-50
      paper: "#ffffff",
    },

    text: {
      primary: "#0f172a", // slate-900
      secondary: "#475569", // slate-600
    },

    divider: "#e2e8f0", // slate-200
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "sans-serif",
    ].join(","),
    h6: {
      fontWeight: 600,
    },
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          boxShadow: "none",
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: "rgba(147, 51, 234, 0.08)",
          },
          "&:hover": {
            backgroundColor: "rgba(147, 51, 234, 0.06)",
          },
        },
      },
    },
  },
});
