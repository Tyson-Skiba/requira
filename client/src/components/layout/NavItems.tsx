// navItems.tsx
import {
  HomeIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as SolidHomeIcon,
  EnvelopeIcon as SolidEnvelopeIcon,
  UserGroupIcon as SolidUserGroupIcon,
} from "@heroicons/react/24/solid";

export const navItems = [
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
    icon: <EnvelopeIcon height={24} />,
    solid: <SolidEnvelopeIcon height={24} />,
  },
  {
    label: "Users",
    to: "/users",
    icon: <UserGroupIcon height={24} />,
    solid: <SolidUserGroupIcon height={24} />,
  },
];
