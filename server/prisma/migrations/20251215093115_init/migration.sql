-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" INTEGER NOT NULL,
    "cover" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "request_user_id" INTEGER NOT NULL,
    "approver_user_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL,
    CONSTRAINT "Queue_request_user_id_fkey" FOREIGN KEY ("request_user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Queue_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "songs" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SourceBlacklist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceBlacklist_source_key" ON "SourceBlacklist"("source");
