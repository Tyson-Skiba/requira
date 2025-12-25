declare module "express-serve-static-core" {
  interface Request {
    user?: { userId: number; role?: string };
  }
}

// This export makes ts-node treat it as a module
export const __expressTypes: void = undefined;
