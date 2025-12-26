import fs from "fs";
import axios, { AxiosResponse } from "axios";
import contentDisposition from "content-disposition";
import { JSDOM } from "jsdom";
import { LibGenBookProvider } from "../services/libgen-book-service";

import type { Request, Response, NextFunction } from "express";
import {
  findDownlaodedItems,
  findQueuedItems,
  prisma,
  queueItem,
} from "../services/database";
import { getPathFromBookId } from "../services/metadata-service";
import { Prisma } from "../db/prisma";

interface Download {
  stream: AxiosResponse;
  onStart: (fileanme: string, total: number) => void;
  onData: (filename: string, chunk: Buffer, total: number) => void;
}

interface DownloadResult {
  path: string;
  filename: string;
  total: number;
}

const adapter = new LibGenBookProvider(process.env.BOOK_SOURCE_URL!);

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-\._()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function attemptWithRetry<T>(
  cb: () => T,
  onFail?: (message: string) => void,
  onError?: (message: string) => void,
  onComplete?: () => void,
) {
  for (let i = 0; i < 5; i++) {
    try {
      const result = await cb();

      if (onComplete) {
        onComplete();
      }

      return result;
    } catch (e: any) {
      if (onFail) {
        onFail(`Request failed, trying again ${i + 1}/${5}`);
      }

      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 220);
      });

      if (i + 1 === 5) {
        if (onError) {
          onError(e?.message);
        }
      }
    }
  }
  return null;
}

async function getDocument(searchURL: string): Promise<Document> {
  try {
    const response = await axios.get(searchURL);
    const htmlString = response.data; // Axios gives you the response body here
    return new JSDOM(htmlString).window.document;
  } catch (e) {
    throw new Error(`Error occurred while fetching document of ${searchURL}`);
  }
}

async function downloadFile({ stream, onStart, onData }: Download) {
  return new Promise<DownloadResult>((resolve, reject) => {
    const MAX_FILE_NAME_LENGTH = 128;

    const downloadContentDisposition = stream.headers["content-disposition"];
    if (!downloadContentDisposition) {
      reject(new Error("No content-disposition header found"));
      return;
    }

    const parsedContentDisposition = contentDisposition.parse(
      downloadContentDisposition,
    );
    const cleanFilename = sanitizeFilename(
      parsedContentDisposition.parameters.filename!,
    );
    const slicedFileName = cleanFilename.slice(
      Math.max(cleanFilename.length - MAX_FILE_NAME_LENGTH, 0),
      cleanFilename.length,
    );
    const path = `${process.env.REQUIRA_BOOK_DOWNLOAD_LOCATION}/${slicedFileName}`;

    const file = fs.createWriteStream(path);
    const total = Number(stream.headers["content-length"] || 0);
    const filename = slicedFileName;

    if (!stream.data) {
      return;
    }

    onStart(filename, total);

    stream.data.on("data", (chunk: Buffer) => {
      onData(filename, chunk, total);
    });

    stream.data.on("end", () => {
      const downloadResult = {
        path,
        filename,
        total,
      };

      resolve(downloadResult);
    });

    stream.data.on("error", () => {
      reject(new Error(`(${filename}) Error occurred while downloading file`));
    });

    stream.data.pipe(file);
  });
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageSize = 20;
    const cursor = Number(req.query.cursor);
    const searchTerm = String(req.query.searchTerm).toLowerCase();

    const where: Prisma.BookWhereInput = !searchTerm
      ? {}
      : {
          OR: [
            {
              title: { contains: searchTerm },
            },
            { authors: { contains: searchTerm } },
            { publisher: { contains: searchTerm } },
          ],
        };

    const books = await prisma.book.findMany({
      where,
      take: pageSize + 1,
      skip: cursor ? 1 : 0,
      orderBy: { created_at: "desc" },
      ...(cursor && {
        cursor: { id: cursor },
      }),
    });

    const hasNextPage = books.length > pageSize;
    const items = hasNextPage ? books.slice(0, pageSize) : books;

    res.json({
      items,
      nextCursor: hasNextPage ? items.at(-1)?.id : null,
    });
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
    const term = req.query.term as string;
    const url = adapter.getSearchURL(term, 1, 25);
    console.log(url);
    const pageDocument = await attemptWithRetry(() => getDocument(url));
    let entries = adapter.parseEntries(pageDocument!);

    const queuedItems = await findQueuedItems(entries.map(({ id }) => id));
    const queuedIds = queuedItems.map(({ external_id }) => external_id);

    const existingItems = await findDownlaodedItems(
      entries.map(({ id }) => id),
    );
    const existingIds = existingItems.map(({ external_id }) => external_id);

    const searchIds = entries.map((entry) => entry.id);

    const blacklisted = await prisma.sourceBlacklist.findMany({
      where: {
        source: {
          in: searchIds,
        },
      },
    });

    entries = entries
      .map((result) => ({
        ...result,
        queued: queuedIds.includes(result.id),
        downloaded: existingIds.includes(result.id),
      }))
      .filter((entry) => !blacklisted.map((l) => l.source).includes(entry.id));

    res.status(201).json(entries);
    //res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

export const download = async (externalId: string, mirror: string) => {
  console.log(`Starting download for ${externalId}`);
  const pageUrl = adapter.getPageURL(mirror);
  console.log("Using " + pageUrl);
  const pageDocument = await attemptWithRetry(() => getDocument(pageUrl));
  const downloadUrl = adapter.getMainDownloadURLFromDocument(pageDocument!)!;

  const stream = await attemptWithRetry(() =>
    axios.get(downloadUrl, {
      httpAgent: "Book App Version 1.0.0",
      responseType: "stream",
    }),
  );
  console.log(downloadUrl);

  return await downloadFile({
    stream: stream!,
    onStart: (filename, total) => {
      // ui
      console.log(`Downloading ${filename}`);
    },
    onData: (filename, chunk, total) => {
      // ui
    },
  });
};

export const queue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      id,
      authors,
      publisher,
      year,
      pages,
      language,
      size,
      extension,
      mirror,
      cover,
      title,
    } = req.query;

    const item = await queueItem("book", cover as string, id as string, {
      id,
      authors,
      publisher,
      year,
      pages,
      language,
      size,
      extension,
      mirror,
      cover,
      title,
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const book = await prisma.book.findFirst({
      where: {
        id,
      },
    });

    if (!book) throw new Error("Book not found");

    if (req.query.remove === "true") {
      const bookPath = book.filepath;
      console.log(`Deleting ${bookPath}`);
      fs.unlinkSync(bookPath);
      console.log(`Deleted ${book.title}`);
    }

    if (req.query.avoid === "true") {
      await prisma.sourceBlacklist.create({
        data: {
          source: book.external_id,
        },
      });

      console.log(`Blacklisted ${book.external_id}`);
    }

    await prisma.book.delete({
      where: {
        id,
      },
    });

    console.log(`Removed ${book.title} from library`);
  } catch (error) {
    next(error);
  }
};
