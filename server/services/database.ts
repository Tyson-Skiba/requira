import "dotenv/config";
import { Request } from "express";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../db/prisma/client";
import { hashPassword } from "../controllers/user-controller";
import { queueActivityType } from "../../models/activity/activity-type";
import { UserRoles } from "../../models/users/role";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export const dataTypes = {
  music: 1,
  book: 2,
};

const approverRole: UserRoles = "Approver";

export const createAdminAccount = async () => {
  const adminUser = await prisma.user.findFirst({
    where: {
      isAdmin: true,
    },
  });

  if (adminUser) return;

  const user = await prisma.user.create({
    data: {
      username: String(process.env.ADMIN_USERNAME),
      password: await hashPassword(String(process.env.ADMIN_PASSWORD)),
      isAdmin: true,
      isApprover: true,
      canSeeFullLibrary: true,
      email: "",
    },
  });
  console.log("Created user:", user);

  const allUsers = await prisma.user.findMany({
    include: {
      approvedQueues: true,
      requestedQueues: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
};

export const findQueuedItems = async (ids: string[]) => {
  return await prisma.queue.findMany({
    where: {
      external_id: {
        in: ids,
      },
    },
  });
};

export const findDownlaodedItems = async (ids: string[]) => {
  const songs = await prisma.song.findMany({
    where: {
      external_id: {
        in: ids,
      },
    },
  });

  const books = await prisma.book.findMany({
    where: {
      external_id: {
        in: ids,
      },
    },
  });

  return [...songs, ...books];
};

export const queueItem = async <T extends Record<string, unknown>>(
  type: keyof typeof dataTypes,
  cover: string,
  externalId: string,
  data: T,
  requestUser: NonNullable<Request["user"]>,
) => {
  const item = await prisma.queue.create({
    data: {
      type: dataTypes[type],
      cover,
      data: JSON.stringify(data),
      external_id: externalId,
      request_user_id: requestUser.userId,
      approver_user_id: requestUser.roles.includes(approverRole)
        ? requestUser.userId
        : null,
      attempts: 0,
    },
  });

  await prisma.activityLog.create({
    data: {
      triggered_by_user_id: requestUser.userId,
      type: queueActivityType,
      details: `The ${type} ${data["title"]} has been added to the download queue`,
    },
  });

  return item;
};

export { prisma };
