// navItems.tsx
import {
  BellIcon,
  HomeIcon,
  EnvelopeIcon,
  UserGroupIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

import {
  BellIcon as SolidBellIcon,
  HomeIcon as SolidHomeIcon,
  EnvelopeIcon as SolidEnvelopeIcon,
  UserGroupIcon as SolidUserGroupIcon,
  HandRaisedIcon as SolidHandRaisedIcon,
} from "@heroicons/react/24/solid";

interface NavItemsParams {
  isMobile: boolean;
  isAdmin: boolean;
}

export const navItems = ({ isAdmin, isMobile }: NavItemsParams) => [
  {
    label: "My Library",
    to: "/",
    icon: <HomeIcon height={24} />,
    solid: <SolidHomeIcon height={24} />,
    end: true,
  },
  {
    label: "Requests",
    to: "/requests",
    icon: <HandRaisedIcon height={24} />,
    solid: <SolidHandRaisedIcon height={24} />,
  },
  {
    label: isAdmin ? "Users" : "My Profile",
    to: isAdmin ? "/users" : "/profile",
    icon: isAdmin ? <UserGroupIcon height={24} /> : <BellIcon height={24} />,
    solid: isAdmin ? (
      <SolidUserGroupIcon height={24} />
    ) : (
      <SolidBellIcon height={24} />
    ),
  },
];
