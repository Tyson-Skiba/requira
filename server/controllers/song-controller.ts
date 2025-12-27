import fs from "fs";
import type { Request, Response, NextFunction } from "express";
import { MusicBrainzProvider } from "../services/music-brainz-music-service";
import {
  findDownlaodedItems,
  findQueuedItems,
  prisma,
  queueItem,
} from "../services/database";
import { Prisma } from "../db/prisma";
import { logger } from "../services/log-service";

const musicBrainzProvider = new MusicBrainzProvider();

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageSize = 20;
    const cursor = Number(req.query.cursor);
    const searchTerm = String(req.query.searchTerm).toLowerCase();

    const where: Prisma.SongWhereInput = !searchTerm
      ? {}
      : {
          OR: [
            {
              title: { contains: searchTerm },
            },
            { artist: { contains: searchTerm } },
            { artist_mbid: { contains: searchTerm } },
            { album: { contains: searchTerm } },
            { isrc: { contains: searchTerm } },
            { recording_mbid: { contains: searchTerm } },
          ],
        };

    const songs = await prisma.song.findMany({
      where,
      take: pageSize + 1,
      skip: cursor ? 1 : 0,
      orderBy: { created_at: "desc" },
      ...(cursor && {
        cursor: { id: cursor },
      }),
    });

    const hasNextPage = songs.length > pageSize;
    const items = hasNextPage ? songs.slice(0, pageSize) : songs;

    res.json({
      items,
      nextCursor: hasNextPage ? items.at(-1)?.id : null,
    });
  } catch (error) {
    next(error);
  }
};

export const create = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({});
    //res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

export const search = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, artist } = req.query;
    if (!title || !artist) {
      return res.status(400).send("Missing title or artist");
    }

    try {
      let results = await musicBrainzProvider.search(
        title as string,
        artist as string,
      );

      const queuedItems = await findQueuedItems(results.map(({ id }) => id));
      const queuedIds = queuedItems.map(({ external_id }) => external_id);

      const existingItems = await findDownlaodedItems(
        results.map(({ id }) => id),
      );
      const existingIds = existingItems.map(({ external_id }) => external_id);

      results = results.map((result) => ({
        ...result,
        queued: queuedIds.includes(result.id),
        downloaded: existingIds.includes(result.id),
      }));

      res.json(results);
    } catch (err: any) {
      logger.error("MusicBrainz search error:", err.message);
      res.status(500).send("MusicBrainz search failed");
    }
  } catch (error) {
    next(error);
  }
};

export const queue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    query,
    mbid,
    title,
    artist,
    album,
    releaseDate,
    artistMbid,
    isrc,
    cover,
  } = req.query;

  const item = await queueItem(
    "music",
    cover as string,
    mbid as string,
    {
      query,
      mbid,
      title,
      artist,
      album,
      releaseDate,
      artistMbid,
      isrc,
      cover,
    },
    req.user!,
  );

  logger.info(`Queued song ${title} for download`);

  res.json(item);
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const song = await prisma.song.findFirst({
      where: {
        id,
      },
    });

    if (!song) throw new Error("Song not found");

    if (req.query.remove === "true") {
      const songPath = song.filepath;
      logger.info(`Deleting song at ${songPath}`);
      fs.unlinkSync(songPath);
      logger.info(`Deleted song ${song.title}`);
    }

    if (req.query.avoid === "true") {
      await prisma.sourceBlacklist.create({
        data: {
          source: song.source!,
        },
      });

      logger.info(`Blacklisted song ${song.source}`);
    }

    await prisma.song.delete({
      where: {
        id,
      },
    });

    logger.info(`Removed song ${song.title} from library`);
  } catch (error) {
    next(error);
  }
};
