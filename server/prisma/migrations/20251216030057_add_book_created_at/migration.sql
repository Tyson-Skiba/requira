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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_books" ("authors", "cover", "extension", "external_id", "id", "language", "mirror", "pages", "publisher", "size", "title", "year") SELECT "authors", "cover", "extension", "external_id", "id", "language", "mirror", "pages", "publisher", "size", "title", "year" FROM "books";
DROP TABLE "books";
ALTER TABLE "new_books" RENAME TO "books";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
