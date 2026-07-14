-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "audioMimeType" TEXT,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "playCount" INTEGER NOT NULL DEFAULT 0;
