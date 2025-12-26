import { UserRoles } from "../../models/users/role";

declare module "express-serve-static-core" {
  interface Request {
    user?: { userId: number; roles: UserRoles[] };
  }
}

// This export makes ts-node treat it as a module
export const __expressTypes: void = undefined;
