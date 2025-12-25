export interface User {
  id: number;
  username: string;
  avatar?: string;
  isAdmin: boolean;
  // email: string;
  requiresApproval: boolean;
  isApprover: boolean;
  canSeeFullLibrary: boolean;
  theme: "light" | "dark";
}
