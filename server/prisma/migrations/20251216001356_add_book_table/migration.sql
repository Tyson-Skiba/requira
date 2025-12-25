-- CreateTable
CREATE TABLE "books" (
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
    "cover" TEXT
);
