// Sidebar.tsx
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { navItems } from "./NavItems";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        width: 260,
        display: { xs: "none", md: "block" },
      }}
      bgcolor="background.paper"
      borderRight="1px solid"
      borderColor="divider"
      color="text.secondary"
      px={2}
      py={3}
    >
      <Typography variant="h1" mb={1}>
        <img src="/logo.png" alt="Logo" style={{ width: "100%" }} />
      </Typography>

      <List disablePadding>
        {navItems({
          isAdmin: user.isAdmin,
          isMobile: false,
        }).map(({ label, to, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {({ isActive }) => (
              <ListItemButton selected={isActive}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>
    </Box>
  );
};
