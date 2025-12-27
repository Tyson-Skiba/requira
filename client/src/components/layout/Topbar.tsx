import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  Avatar,
  styled,
  Badge,
  Menu,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSearch } from "../../context/SearchContext";
import { useState, useEffect, useRef } from "react";
import { UIMatch, useMatches, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usersApi } from "../../api/users";
import { Profile } from "../user/Profile";
import { useActivities } from "../../context/ActivityContext";

interface Handle {
  term: string;
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      //animation: "ripple 2.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

export const Topbar: React.FC = () => {
  const { user } = useAuth();
  const { unseen } = useActivities();
  const [avatar, setAvatar] = useState(user.avatar);
  const matches = useMatches() as UIMatch<unknown, Handle>[];
  const navigate = useNavigate();
  const { setSearchTerm } = useSearch();
  const { setViewed } = useActivities();
  const [inputValue, setInputValue] = useState("");
  const [avatarAnchor, setAvatarAnchor] = useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isMobile) navigate("/profile");
    else setAvatarAnchor(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchor(null);
    setViewed();
  };

  const placeholderTerm = matches.at(-1)?.handle?.term;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [inputValue, setSearchTerm]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar>
        <TextField
          size="small"
          placeholder={`Search ${placeholderTerm}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlassIcon width={20} height={20} />
                </InputAdornment>
              ),
              endAdornment: inputValue ? (
                <InputAdornment position="start" sx={{ cursor: "pointer" }}>
                  <XMarkIcon
                    width={20}
                    height={20}
                    onClick={() => {
                      setSearchTerm("");
                      setInputValue("");
                    }}
                  />
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          variant={unseen ? "dot" : "standard"}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              marginLeft: "1rem",
            }}
            src={avatar}
            onClick={handleAvatarClick}
          >
            {user.username[0]}
          </Avatar>
        </StyledBadge>
      </Toolbar>
      {isMobile ? null : (
        <Menu
          anchorEl={avatarAnchor}
          open={Boolean(avatarAnchor)}
          onClose={handleAvatarClose}
        >
          <Profile
            width={isMobile ? undefined : 400}
            onAvatarChange={setAvatar}
          />
        </Menu>
      )}
    </AppBar>
  );
};
