-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_books" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "authors" TEXT,
    "title" TEXT,
    "publisher" TEXT,
    "year" INTEGER,
    "pages" INTEGER,
    "language" TEXT,
    "size" TEXT,
    "extension" TEXT,
    "mirror" TEXT,
    "cover" TEXT,
    "filepath" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cache_key" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_books" ("authors", "cover", "created_at", "extension", "external_id", "filepath", "id", "language", "mirror", "pages", "publisher", "size", "title", "year") SELECT "authors", "cover", "created_at", "extension", "external_id", "filepath", "id", "language", "mirror", "pages", "publisher", "size", "title", "year" FROM "books";
DROP TABLE "books";
ALTER TABLE "new_books" RENAME TO "books";
CREATE TABLE "new_songs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recording_mbid" TEXT,
    "artist_mbid" TEXT,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "release_date" DATETIME,
    "isrc" TEXT,
    "cover" TEXT,
    "filepath" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "cache_key" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_songs" ("album", "artist", "artist_mbid", "cover", "created_at", "external_id", "filepath", "id", "isrc", "recording_mbid", "release_date", "title") SELECT "album", "artist", "artist_mbid", "cover", "created_at", "external_id", "filepath", "id", "isrc", "recording_mbid", "release_date", "title" FROM "songs";
DROP TABLE "songs";
ALTER TABLE "new_songs" RENAME TO "songs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
