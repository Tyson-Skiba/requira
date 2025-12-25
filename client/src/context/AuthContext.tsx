import { Navigate, Outlet } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";
import { User } from "../../../models/users/user";

interface AuthContextType {
  user: User;
  loading: boolean;
  setUser: (user: User | undefined) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: {} as User,
  loading: false,
  setUser: () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const response = await authApi.currentUser();
    if (!response.ok) {
      setLoading(false);
      return;
    }

    const data = await response.json();
    setUser(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await authApi.refreshToken();
        if (!res.ok) throw new Error("Refresh failed");

        loadUser();
      } catch {
        setUser(undefined);
      }
    };
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user: user as User, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};
