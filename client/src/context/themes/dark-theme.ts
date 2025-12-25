import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#6b21a8", // deep violet
      light: "#9d4edd", // lighter violet accent
      dark: "#4c1d95", // darker violet
    },

    secondary: {
      main: "#f97316", // bright orange highlights
      light: "#fb923c",
      dark: "#c2410c",
    },

    background: {
      default: "#1e1b29", // deep purple-black wrapper feel
      paper: "#2c2540", // slightly lighter for cards/panels
    },

    text: {
      primary: "#f8f1ff", // off-white for readability
      secondary: "#d8c1ff", // soft violet highlight text
    },

    divider: "#42275a", // subtle violet divider
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
          border: "1px solid #42275a",
          boxShadow: "none",
          backgroundColor: "#2c2540",
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: "rgba(107, 33, 168, 0.2)",
          },
          "&:hover": {
            backgroundColor: "rgba(107, 33, 168, 0.1)",
          },
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        track: {
          backgroundColor: "#42275a",
          opacity: 1,
        },
        thumb: {
          backgroundColor: "#f97316", // orange for the thumb
        },
      },
    },
  },
});
