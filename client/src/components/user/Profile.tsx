import {
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  Switch,
  styled,
  Chip,
  Alert,
  Stack,
  AlertProps,
} from "@mui/material";
import { useRef, ChangeEvent, useState, useEffect } from "react";
import { authApi } from "../../api/auth";
import { usersApi } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeModeContext";
import { useActivities } from "../../context/ActivityContext";

interface ProfileProps {
  width?: number;
  onAvatarChange?: (avatar: string) => void;
}

interface ThemeToggleProps {
  darkMode: boolean;
}

const ThemeToggle = styled(Switch)<ThemeToggleProps>(({ theme, darkMode }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: darkMode ? "#001e3c" : "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          darkMode ? "#001e3c" : "#fff",
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
        ...theme.applyStyles("dark", {
          backgroundColor: "#8796A5",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: darkMode ? "white" : "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        darkMode ? "#001e3c" : "#fff",
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles("dark", {
      backgroundColor: "#003892",
    }),
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
    ...theme.applyStyles("dark", {
      backgroundColor: "#8796A5",
    }),
  },
}));

export const Profile: React.FC<ProfileProps> = ({ width, onAvatarChange }) => {
  const { user, setUser } = useAuth();
  const { activities, unseen, parseActivity, setViewed } = useActivities();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    user?.avatar,
  );
  const { mode, setMode } = useThemeMode();

  if (!user) return <Typography>Loading...</Typography>;

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      const updatedAvatar = await usersApi.updateAvatar(base64);

      setAvatarPreview(updatedAvatar);
      if (onAvatarChange) onAvatarChange(updatedAvatar);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box width={width}>
      <Box display="flex" justifyContent="flex-end">
        <ThemeToggle
          checked={mode === "dark"}
          darkMode={mode === "dark"}
          onChange={(_, checked) => setMode(checked ? "dark" : "light")}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        sx={{ p: 2 }}
      >
        <Avatar
          src={avatarPreview}
          sx={{ width: 150, height: 150, cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}
        >
          {user.username[0]}
        </Avatar>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleAvatarUpload}
        />

        <Box display="flex" flexDirection="column" gap={2} width="100%">
          <TextField label="Username" defaultValue={user.username} fullWidth />

          <Button
            color="error"
            variant="outlined"
            fullWidth
            onClick={async () => {
              await authApi.logout();
              setUser(undefined);
            }}
          >
            Logout
          </Button>

          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ cursor: "pointer", my: 2 }}
            >
              <Typography variant="h6">Activity</Typography>
              {unseen ? (
                <Chip label={unseen} size="small" color="primary" />
              ) : null}
            </Box>
            <Stack spacing={1}>{activities.map(parseActivity)}</Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
