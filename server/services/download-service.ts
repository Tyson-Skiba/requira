import fs from "fs";
import path from "path";
import axios from "axios";
import { PlaylistInfo, VideoInfo, YtDlp } from "ytdlp-nodejs";
import ffmpegStatic from "ffmpeg-static";
import { spawn } from "child_process";
import { download as fetchBook } from "../controllers/book-controller";
import { MusicBrainzSearchResult } from "../../models/songs/music-brainz";
import { Queue } from "../db/prisma";
import { prisma } from "./database";
import { LibGenEntry } from "../../models/books/lib-gen-entry";

const sessions = new Map();

const ytdlp = new YtDlp({
  ffmpegPath: ffmpegStatic!,
});

const createSession = (id: string) => {
  sessions.set(id, { progress: 0, resList: [] });
};

const sanitizeFilename = (name: string) =>
  String(name || "untitled")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[^a-z0-9\-_\s\.]/gi, "_")
    .replace(/\s+/g, "_");

export const downloadSong = async (request: Queue) => {
  const downloadId = crypto.randomUUID();
  createSession(downloadId);

  const { title, artist, album, releaseDate, artistMbid, isrc, cover } =
    JSON.parse(request.data) as MusicBrainzSearchResult;
  const query = `${title} ${artist}`;

  try {
    console.log(`Searching for song ${query}`);
    const info = await ytdlp.getInfoAsync(`ytsearch1:${query}`);
    const video = (info as PlaylistInfo).entries?.[0];

    if (!video?.url) throw new Error("No video found");

    const baseName = sanitizeFilename(`${artist} - ${title}`);
    const tempFlac = path.join(
      process.env.REQUIRA_SONG_DOWNLOAD_LOCATION!,
      `${baseName}.raw.flac`,
    );
    const finalFlac = path.join(
      process.env.REQUIRA_SONG_DOWNLOAD_LOCATION!,
      `${baseName}.flac`,
    );

    await ytdlp.downloadAsync(video.url, {
      output: tempFlac,
      format: "bestaudio",
      // @ts-expect-error: extra args not in type definition args: ["--extract-audio", "--audio-format", "flac"],
      args: ["--extract-audio", "--audio-format", "flac"],
      onProgress: (p) => {
        console.log("Downloading");
      },
    });

    let coverPath = null;
    if (cover) {
      coverPath = path.join(
        process.env.REQUIRA_SONG_DOWNLOAD_LOCATION!,
        `${baseName}.jpg`,
      );
      const img = await axios.get(cover, { responseType: "arraybuffer" });
      fs.writeFileSync(coverPath, img.data);
    }

    const ffArgs = ["-y", "-i", tempFlac];

    if (coverPath) {
      ffArgs.push(
        "-i",
        coverPath,
        "-map",
        "0:a",
        "-map",
        "1",
        "-metadata:s:v",
        "title=Album cover",
        "-metadata:s:v",
        "comment=Cover (front)",
        "-disposition:v",
        "attached_pic",
      );
    }

    ffArgs.push(
      "-metadata",
      `TITLE=${title}`,
      "-metadata",
      `ARTIST=${artist}`,
      "-metadata",
      `ALBUM=${album || ""}`,
      "-metadata",
      `DATE=${releaseDate || ""}`,
      "-metadata",
      `ISRC=${isrc || ""}`,
      "-metadata",
      `MUSICBRAINZ_TRACKID=${request.external_id || ""}`,
      "-metadata",
      `MUSICBRAINZ_ARTISTID=${artistMbid || ""}`,
      finalFlac,
    );

    await new Promise<void>((resolve, reject) => {
      const ff = spawn(ffmpegStatic!, ffArgs);
      ff.on("close", (code) => (code === 0 ? resolve() : reject()));
    });

    fs.unlinkSync(tempFlac);
    if (coverPath) fs.unlinkSync(coverPath);

    await prisma.song.create({
      data: {
        recording_mbid: request.external_id,
        artist_mbid: artistMbid,
        title,
        artist,
        album,
        release_date: releaseDate ? new Date(releaseDate) : null,
        isrc,
        cover,
        source: video.url,
        filepath: finalFlac,
        external_id: request.external_id,
      },
    });

    await prisma.queue.delete({
      where: {
        id: request.id,
      },
    });
  } catch (error) {
    console.error(`ERROR: ${error}`);

    await prisma.queue.update({
      where: {
        id: request.id,
      },
      data: {
        attempts: request.attempts + 1,
      },
    });
  }
};

export const downloadBook = async (request: Queue) => {
  try {
    const {
      authors,
      title,
      publisher,
      year,
      pages,
      language,
      size,
      extension,
      mirror,
      cover,
    } = JSON.parse(request.data) as LibGenEntry;

    console.log(request.data);

    const { path: filepath } = await fetchBook(request.external_id, mirror);

    /* TODO: Save cover to disk */
    await prisma.book.create({
      data: {
        authors,
        title,
        publisher,
        year: Number(year),
        pages: Number(pages),
        language,
        size,
        extension,
        mirror,
        cover,
        filepath,
        external_id: request.external_id,
      },
    });

    await prisma.queue.delete({
      where: {
        id: request.id,
      },
    });
  } catch (error) {
    console.error(`ERROR: ${error}`);

    await prisma.queue.update({
      where: {
        id: request.id,
      },
      data: {
        attempts: request.attempts + 1,
      },
    });
  }
};
