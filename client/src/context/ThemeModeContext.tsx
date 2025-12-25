import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { ThemeProvider, CssBaseline, Theme } from "@mui/material";
import { lightTheme } from "./themes/light-theme";
import { darkTheme } from "./themes/dark-theme";
import { useAuth } from "./AuthContext";

type ThemeMode = "dark" | "light";

type ThemeMap = {
  [P in ThemeMode]: Theme;
};

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

interface ThemeModeProviderProps {
  children: ReactNode;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined,
);

const map: ThemeMap = {
  light: lightTheme,
  dark: darkTheme,
};

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    if (user?.theme) setMode(user.theme);
  }, [user?.theme]);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={map[mode]}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context)
    throw new Error("useSearch must be used within a ThemeModeProvider");

  return context;
};
