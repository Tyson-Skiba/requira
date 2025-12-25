// MobileBottomNav.tsx
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "./NavItems";

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", md: "none" },
        zIndex: 1300,
        pb: "env(safe-area-inset-bottom)",
      }}
      elevation={3}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => navigate(newValue)}
        showLabels
      >
        {navItems.map(({ label, to, icon, solid }) => {
          const isActive = location.pathname === to;
          return (
            <BottomNavigationAction
              key={to}
              label={undefined}
              value={to}
              icon={isActive ? solid : icon}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
};
