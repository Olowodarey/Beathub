-- CreateEnum
CREATE TYPE "PlaylistInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED');

-- CreateTable
CREATE TABLE "PlaylistInvite" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "status" "PlaylistInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "PlaylistInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaylistInvite_inviteeId_status_idx" ON "PlaylistInvite"("inviteeId", "status");

-- CreateIndex
CREATE INDEX "PlaylistInvite_playlistId_status_idx" ON "PlaylistInvite"("playlistId", "status");

-- AddForeignKey
ALTER TABLE "PlaylistInvite" ADD CONSTRAINT "PlaylistInvite_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistInvite" ADD CONSTRAINT "PlaylistInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistInvite" ADD CONSTRAINT "PlaylistInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
