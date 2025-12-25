-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "isApprover" BOOLEAN NOT NULL DEFAULT true,
    "musicLibraryPath" TEXT,
    "bookLibraryPath" TEXT,
    "canSeeFullLibrary" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("email", "id", "username") SELECT "email", "id", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
