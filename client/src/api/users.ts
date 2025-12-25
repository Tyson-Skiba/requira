import { User } from "../../../models/users/user";
import fetch from "../../../node_modules/node-fetch-native/lib/index.d";

const getAll = async (): Promise<User[]> => {
  const request = await fetch("/api/users");
  return await request.json();
};

const create = async ({
  username,
  requiresApproval,
  isApprover,
  canSeeFullLibrary,
  password,
}: Partial<User> & { password: string }): Promise<User> => {
  const request = await fetch(
    `/api/users?username=${username}&requiresApproval=${requiresApproval}&isApprover=${isApprover}&canSeeFullLibrary=${canSeeFullLibrary}&password=${password}`,
    {
      method: "POST",
    },
  );
  return await request.json();
};

const update = async (id: number, user: Partial<User>) => {
  const params = new URLSearchParams();

  if (user.username) params.append("username", user.username);
  if (user.isApprover !== undefined)
    params.append("isApprover", String(user.isApprover));
  if (user.requiresApproval !== undefined)
    params.append("requiresApproval", String(user.requiresApproval));
  if (user.canSeeFullLibrary !== undefined)
    params.append("canSeeFullLibrary", String(user.canSeeFullLibrary));

  const response = await fetch(`/api/users/${id}?${params.toString()}`, {
    method: "PUT",
  });

  return await response.json();
};

const remove = async (id: number): Promise<void> => {
  await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });
};

const resetPassword = async (
  id: number,
  newPassword: string,
): Promise<void> => {
  await fetch(`/api/users/${id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }),
  });
};

const updateAvatar = async (avatar: string) => {
  const response = await fetch("/api/users/avatar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatar }),
  });

  const data = await response.json();
  return data.avatar;
};

export const usersApi = {
  getAll,
  create,
  update,
  remove,
  resetPassword,
  updateAvatar,
};
