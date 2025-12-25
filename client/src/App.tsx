import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { MusicPage } from "./pages/MusicPage";
import { BookPage } from "./pages/BookPage";
import { RequestPage } from "./pages/RequestPage";
import { UserManagementPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
        handle: { term: "library" },
      },
      {
        path: "/songs",
        element: <MusicPage />,
        handle: { term: "songs" },
      },
      {
        path: "/books",
        element: <BookPage />,
        handle: { term: "books" },
      },
      {
        path: "/requests",
        element: <RequestPage />,
        handle: { term: "requests" },
      },
      {
        path: "/users",
        element: <UserManagementPage />,
        handle: { term: "users" },
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

export const App = () => <RouterProvider router={router} />;
