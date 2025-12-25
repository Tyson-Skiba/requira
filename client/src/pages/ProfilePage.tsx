import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Profile } from "../components/user/Profile";

export const ProfilePage: React.FC = () => {
  return (
    <DashboardLayout hideTopbar>
      <Profile />
    </DashboardLayout>
  );
};
