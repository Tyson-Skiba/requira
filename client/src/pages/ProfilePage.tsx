import { useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Profile } from "../components/user/Profile";
import { useActivities } from "../context/ActivityContext";

export const ProfilePage: React.FC = () => {
  const { setViewed } = useActivities();

  useEffect(() => () => setViewed());

  return (
    <DashboardLayout hideTopbar>
      <Profile />
    </DashboardLayout>
  );
};
