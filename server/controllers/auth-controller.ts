import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/database";
import { UserRoles } from "../../models/users/role";

const generateTokens = (userId: number, roles: UserRoles[]) => {
  const accessToken = jwt.sign({ userId, roles }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    { userId, roles },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "2d",
    },
  );
  return { accessToken, refreshToken };
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const roles: UserRoles[] = ["User"];
    if (user.isAdmin) roles.push("Admin");
    const { accessToken, refreshToken } = generateTokens(user.id, roles);

    res.cookie("auth", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    user.password = "";

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorised" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (user) user.password = "";

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const refresh = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.refresh;
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: number;
    };
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    res.cookie("auth", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ success: true });
  } catch {
    res.status(401).json({ error: "Refresh token expired" });
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("auth", { httpOnly: true, sameSite: "strict" });
  res.clearCookie("refresh", { httpOnly: true, sameSite: "strict" });
  res.json({ success: true });
};
