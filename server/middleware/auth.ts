import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserRoles } from "../../models/users/role";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies?.auth;
  const refreshToken = req.cookies?.refresh;

  if (!accessToken && !refreshToken)
    return res.status(401).json({ error: "Unauthorized" });

  try {
    if (accessToken) {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
        userId: number;
        roles: UserRoles[];
      };
      req.user = decoded;
      return next();
    }

    if (refreshToken) {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { userId: number; roles: UserRoles[] };

      const newAccessToken = jwt.sign(
        { userId: decodedRefresh.userId },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" },
      );

      res.cookie("auth", newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
      });

      req.user = decodedRefresh;
      return next();
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid token" });
  }
};
