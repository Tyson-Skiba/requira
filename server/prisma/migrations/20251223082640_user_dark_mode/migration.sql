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
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "canSeeFullLibrary" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'light'
);
INSERT INTO "new_User" ("avatar", "bookLibraryPath", "canSeeFullLibrary", "email", "id", "isAdmin", "isApprover", "musicLibraryPath", "password", "requiresApproval", "username") SELECT "avatar", "bookLibraryPath", "canSeeFullLibrary", "email", "id", "isAdmin", "isApprover", "musicLibraryPath", "password", "requiresApproval", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
