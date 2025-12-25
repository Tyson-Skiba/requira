import ffmpegPath from "ffmpeg-static";
import EPub from "epub2";
import JSZip from "jszip";
import fs from "fs";
import xml2js from "xml2js";
import axios from "axios";
import path from "path";
import mm from "music-metadata";
import { execFile } from "child_process";
import { prisma } from "./database";

export type EpubMetadata = {
  title: string;
  author: string;
  language: string;
  isbn: string;
  series: string;
  seriesIndex: string;
  coverFile?: Buffer;
};

export const readEpubMetadata = (epubPath: string): Promise<EpubMetadata> =>
  new Promise((resolve, reject) => {
    const epub = new EPub(epubPath);

    epub.on("end", () => {
      const md = epub.metadata || {};

      resolve({
        title: md.title ?? "",
        author: md.creator ?? "",
        language: md.language ?? "",
        isbn: md.identifier ?? "",
        series: md["belongs-to-collection"] ?? md["calibre:series"] ?? "",
        seriesIndex: md["group-position"] ?? md["calibre:series_index"] ?? "",
      });
    });

    epub.on("error", reject);
    epub.parse();
  });

export const updateEpubMetadata = async (
  epubPath: string,
  bookId: number,
  updates: EpubMetadata,
): Promise<void> => {
  console.log("Updating book");
  const buffer = await fs.readFileSync(epubPath);
  const zip = await JSZip.loadAsync(buffer);

  const opfPath = Object.keys(zip.files).find((f) => f.endsWith(".opf"));
  if (!opfPath) throw new Error("OPF not found");

  const opfXml = await zip.file(opfPath)!.async("string");
  const opf = await xml2js.parseStringPromise(opfXml);

  const md = opf.package.metadata[0];

  md["dc:title"] = [updates.title];
  md["dc:creator"] = [updates.author];
  md["dc:identifier"] = [updates.isbn];

  md.meta = (md.meta || []).filter(
    (m: any) =>
      ![
        "belongs-to-collection",
        "group-position",
        "calibre:series",
        "calibre:series_index",
        "cover",
      ].includes(m.$?.property),
  );

  if (updates.series) {
    md.meta.push({
      $: { property: "belongs-to-collection" },
      _: updates.series,
    });

    md.meta.push({
      $: { property: "calibre:series" },
      _: updates.series,
    });
  }

  if (updates.seriesIndex) {
    md.meta.push({
      $: { property: "group-position" },
      _: String(updates.seriesIndex),
    });

    md.meta.push({
      $: { property: "calibre:series_index" },
      _: String(updates.seriesIndex),
    });
  }

  if (updates.coverFile) {
    const manifest = opf.package.manifest[0].item || [];

    let coverItem = manifest.find(
      (i: any) =>
        i.$["media-type"]?.startsWith("image/") && /cover/i.test(i.$.id),
    );

    if (!coverItem) {
      coverItem = manifest.find((i: any) =>
        i.$["media-type"]?.startsWith("image/"),
      );
    }

    const coverId = coverItem?.$.id ?? "cover";
    const coverHref = coverItem?.$.href ?? "Images/cover.jpg";

    zip.file(
      coverHref.startsWith("/") ? coverHref.slice(1) : coverHref,
      updates.coverFile,
    );

    md.meta = md.meta || [];

    md.meta = md.meta.filter(
      (m: any) => !(m.$?.name === "cover" || m.$?.property === "cover-image"),
    );

    md.meta.push({ $: { name: "cover" }, _: coverId });

    md.meta.push({
      $: { property: "cover-image", refines: `#${coverId}` },
    });

    if (!manifest.find((i: any) => i.$.id === coverId)) {
      manifest.push({
        $: {
          id: coverId,
          href: coverHref,
          "media-type": "image/jpeg",
        },
      });
    }

    opf.package.manifest[0].item = manifest;

    await prisma.book.update({
      where: { id: bookId },
      data: {
        cache_key: {
          increment: 1,
        },
      },
    });
  }

  const builder = new xml2js.Builder();
  zip.file(opfPath, builder.buildObject(opf));

  const updated = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  await fs.writeFileSync(epubPath, updated);
};

export const autofillByISBN = async (isbn: string) => {
  const editionRes = await axios.get(
    `https://openlibrary.org/isbn/${isbn}.json`,
  );

  const edition = editionRes.data;

  let author = "";

  if (edition.authors?.[0]?.key) {
    const a = await axios.get(
      `https://openlibrary.org${edition.authors[0].key}.json`,
    );
    author = a.data.name ?? "";
  }

  let series = "";

  if (edition.works?.[0]?.key) {
    const workRes = await axios.get(
      `https://openlibrary.org${edition.works[0].key}.json`,
    );

    const work = workRes.data;

    if (
      Array.isArray(work.series) &&
      typeof work.series[0] === "string" &&
      !work.series[0].includes(":")
    ) {
      series = work.series[0];
    }
  }

  return {
    title: edition.title ?? "",
    author,
    series,
  };
};

export const autofillFromMusicBrainz = async (recordingId: string) => {
  const { data } = await axios.get(
    `https://musicbrainz.org/ws/2/recording/${recordingId}`,
    {
      params: {
        inc: "artists+releases",
        fmt: "json",
      },
      headers: {
        "User-Agent": "TuneTale/1.0.0",
      },
    },
  );

  const release = data.releases?.[0];
  const artist = data["artist-credit"]?.[0]?.artist;

  return {
    title: data.title ?? "",
    artist: artist?.name ?? "",
    album: release?.title ?? "",
    albumArtist: artist?.name ?? "",
    track: release?.media?.[0]?.tracks?.[0]?.number ?? "",
    disc: release?.media?.[0]?.position?.toString() ?? "1",
    year: release?.date?.split("-")[0] ?? "",
    musicBrainzId: recordingId,
  };
};

export const getPathFromBookId = async (ref: string) => {
  const id = Number(ref);
  const book = await prisma.book.findFirst({
    where: {
      id,
    },
  });

  return book?.filepath!;
};

export const getPathFromSongId = async (ref: string) => {
  const id = Number(ref);
  const song = await prisma.song.findFirst({
    where: {
      id,
    },
  });

  return song?.filepath!;
};

export const extractBookCover = async (
  epubPath: string,
): Promise<Buffer | null> => {
  const buffer = await fs.readFileSync(epubPath);
  const zip = await JSZip.loadAsync(buffer);

  const opfPath = Object.keys(zip.files).find((f) => f.endsWith(".opf"));
  if (!opfPath) return null;

  const opfXml = await zip.file(opfPath)!.async("string");
  const { parseStringPromise } = await import("xml2js");
  const opf = await parseStringPromise(opfXml);

  const metadata = opf.package.metadata[0];
  let coverId: string | undefined;

  const metaArray = metadata.meta || [];
  for (const m of metaArray) {
    if (m.$?.name === "cover") {
      coverId = m._ || m.$.content;
      break;
    }
  }

  if (!coverId) return null;

  const manifest = opf.package.manifest[0].item || [];
  const coverItem = manifest.find((i: any) => i.$.id === coverId);
  if (!coverItem) return null;

  const coverPath = coverItem.$.href.startsWith("/")
    ? coverItem.$.href.slice(1)
    : coverItem.$.href;

  const fullPath = zip.file(coverPath)
    ? coverPath
    : Object.keys(zip.files).find((f) => f.endsWith(coverPath));
  if (!fullPath) return null;

  const coverBuffer = await zip.file(fullPath)!.async("nodebuffer");
  return coverBuffer;
};

export const readAudioMetadata = async (path: string) => {
  const metadata = await mm.parseFile(path);

  const pic = metadata.common.picture?.[0];

  const recordingId =
    metadata.common.musicbrainz_recordingid ??
    Object.values(metadata.native)
      .flat()
      .find(
        (t: any) =>
          t.id === "MusicBrainz Recording Id" ||
          t.id === "MUSICBRAINZ_RECORDINGID",
      )?.value ??
    "";

  return {
    title: metadata.common.title ?? "",
    artist: metadata.common.artist ?? "",
    album: metadata.common.album ?? "",
    albumArtist: metadata.common.albumartist ?? "",
    track: metadata.common.track.no?.toString() ?? "",
    disc: metadata.common.disk.no?.toString() ?? "",
    year: metadata.common.year?.toString() ?? "",
    genre: metadata.common.genre?.[0] ?? "",
    recordingId: recordingId,
    cover: pic
      ? {
          mime: pic.format,
          base64: Buffer.from(pic.data).toString("base64"),
        }
      : null,
  };
};

export const writeAudioMetadata = async (
  filePath: string,
  meta: {
    title: string;
    artist: string;
    album: string;
    albumArtist: string;
    track: string;
    disc: string;
    year: string;
    genre: string;
    coverPath?: string;
  },
) => {
  const tmp = `${filePath}.tmp${path.extname(filePath)}`;

  const args = [
    "-i",
    filePath,
    ...(meta.coverPath ? ["-i", meta.coverPath, "-map", "0", "-map", "1"] : []),
    "-c",
    "copy",
    "-metadata",
    `title=${meta.title}`,
    "-metadata",
    `artist=${meta.artist}`,
    "-metadata",
    `album=${meta.album}`,
    "-metadata",
    `album_artist=${meta.albumArtist}`,
    "-metadata",
    `track=${meta.track}`,
    "-metadata",
    `disc=${meta.disc}`,
    "-metadata",
    `date=${meta.year}`,
    "-metadata",
    `genre=${meta.genre}`,
    ...(meta.coverPath
      ? [
          "-metadata:s:v",
          "title=Album cover",
          "-metadata:s:v",
          "comment=Cover (front)",
        ]
      : []),
    tmp,
  ];

  await new Promise<void>((resolve, reject) => {
    execFile(ffmpegPath!, args, (err) => (err ? reject(err) : resolve()));
  });

  //await fs.move(tmp, filePath, { overwrite: true })

  fs.renameSync(tmp, filePath);
};

export const extractMusicCover = async (
  filePath: string,
): Promise<{ buffer: Buffer<ArrayBuffer>; mime: string } | null> => {
  const metadata = await mm.parseFile(filePath);
  const pic = metadata.common.picture?.[0];
  if (!pic) return null;

  return {
    mime: pic.format,
    buffer: Buffer.from(pic.data),
  };
};
