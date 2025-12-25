const currentUser = async () =>
  await fetch("/api/auth/user", { credentials: "include" });

const refreshToken = async () =>
  await fetch("/api/auth/refresh", {
    credentials: "include",
    method: "POST",
  });

const logout = async () =>
  await fetch("/api/auth/logout", {
    credentials: "include",
    method: "POST",
  });

const login = async (username: string, password: string) =>
  await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

export const authApi = {
  currentUser,
  refreshToken,
  logout,
  login,
};
