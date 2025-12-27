import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../services/database";
import { Prisma, User } from "../db/prisma";

// TODO: Reset password links

const saltRounds = 12;
export const hashPassword = (password: string) =>
  bcrypt.hash(password, saltRounds);

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    const clean = users.map((user) => {
      user.password === "";
      return user;
    });

    res.json(clean);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.roles.includes("Admin")) return res.status(401);

    const password = await hashPassword(String(req.query.password));
    const users = await prisma.user.create({
      data: {
        username: String(req.query.username),
        email: "",
        requiresApproval: req.query.requiresApproval === "true",
        isApprover: req.query.isApprover === "true",
        canSeeFullLibrary: req.query.canSeeFullLibrary === "true",
        password,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "User ID is required" });

    const data: Partial<User> = {};

    if (req.query.username) data.username = String(req.query.username);
    if (req.query.requiresApproval !== undefined)
      data.requiresApproval = req.query.requiresApproval === "true";
    if (req.query.isApprover !== undefined)
      data.isApprover = req.query.isApprover === "true";
    if (req.query.canSeeFullLibrary !== undefined)
      data.canSeeFullLibrary = req.query.canSeeFullLibrary === "true";

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    const { password, ...cleanUser } = user;

    res.json(cleanUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "User ID is required" });
    // TODO: Request must be from admin */

    await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const avatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // use multer for proper uploads
    const { avatar } = req.body;
    if (!avatar || !avatar.startsWith("data:image/")) {
      return res.status(400).json({ error: "Invalid image" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatar },
    });

    res.json({ avatar: updatedUser.avatar });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pageSize = 20;
    const cursor = Number(req.query.cursor);

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.userId!,
      },
    });

    const where: Prisma.ActivityLogWhereInput = user.canSeeFullLibrary
      ? {}
      : {
          triggered_by_user_id: user.id,
        };

    const activities = await prisma.activityLog.findMany({
      orderBy: {
        id: "desc",
      },
      where,
      take: pageSize + 1,
      skip: cursor ? 1 : 0,
      ...(cursor && {
        cursor: { id: cursor },
      }),
    });

    const hasNextPage = activities.length > pageSize;
    const items = hasNextPage ? activities.slice(0, pageSize) : activities;

    res.json({
      items,
      nextCursor: hasNextPage ? items.at(-1)?.id : null,
    });
  } catch (error) {
    next(error);
  }
};
