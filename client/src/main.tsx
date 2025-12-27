import React from "react";
import ReactDOM from "react-dom/client";
import { SnackbarProvider } from "notistack";
import { App } from "./App";
import { SearchProvider } from "./context/SearchContext";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import { ActivityProvider } from "./context/ActivityContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <SearchProvider>
        <AuthProvider>
          <ThemeModeProvider>
            <ActivityProvider>
              <App />
            </ActivityProvider>
          </ThemeModeProvider>
        </AuthProvider>
      </SearchProvider>
    </SnackbarProvider>
  </React.StrictMode>,
);
