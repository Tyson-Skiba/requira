import fs from "fs";
import multer from "multer";
import { Router } from "express";
import {
  autofillByISBN,
  autofillFromMusicBrainz,
  extractBookCover,
  extractMusicCover,
  getPathFromBookId,
  getPathFromSongId,
  readAudioMetadata,
  readEpubMetadata,
  updateEpubMetadata,
  writeAudioMetadata,
} from "../services/metadata-service";
import { prisma } from "../services/database";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/:id/book", upload.single("cover"), async (req, res) => {
  const epubPath = await getPathFromBookId(req.params.id!);

  await updateEpubMetadata(epubPath, Number(req.params.id), {
    ...req.body,
    coverFile: req.file?.buffer,
  });

  res.json({ success: true });
});

router.get("/:id/book", async (req, res) => {
  const epubPath = await getPathFromBookId(req.params.id);
  const metadata = await readEpubMetadata(epubPath);
  res.json(metadata);
});

router.get("/:id/song", async (req, res) => {
  const songPath = await getPathFromSongId(req.params.id);
  const metadata = await readAudioMetadata(songPath);
  res.json(metadata);
});

router.post("/:id/song", upload.single("cover"), async (req, res) => {
  const songPath = await getPathFromSongId(req.params.id!);

  let coverPath: string | undefined;
  if (req.file) {
    coverPath = `${songPath}.cover.jpg`;
    fs.writeFileSync(coverPath, req.file.buffer);

    await prisma.song.update({
      where: { id: Number(req.params.id) },
      data: {
        cache_key: {
          increment: 1,
        },
      },
    });
  }

  await writeAudioMetadata(songPath, {
    ...req.body,
    coverPath,
  });

  if (coverPath) {
    fs.unlinkSync(coverPath);
  }

  res.json({ success: true });
});

router.get("/isbn/:isbn", async (req, res) => {
  const data = await autofillByISBN(req.params.isbn);
  res.json(data);
});

router.get("/recording_id/:id", async (req, res) => {
  const data = await autofillFromMusicBrainz(req.params.id);
  res.json(data);
});

router.get("/:id/book/cover", async (req, res) => {
  const epubPath = await getPathFromBookId(req.params.id);
  const coverBuffer = await extractBookCover(epubPath);
  if (!coverBuffer) return res.status(404).send();
  res.setHeader("Content-Type", "image/jpeg");
  res.send(coverBuffer);
});

router.get("/:id/song/cover", async (req, res) => {
  const songPath = await getPathFromSongId(req.params.id);
  const cover = await extractMusicCover(songPath);
  console.log(songPath);
  if (!cover) return res.status(404).send();
  res.setHeader("Content-Type", cover.mime);
  res.send(cover.buffer);
});

export default router;
