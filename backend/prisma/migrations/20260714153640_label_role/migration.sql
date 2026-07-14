-- CreateEnum
CREATE TYPE "LabelInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "signedLabelId" TEXT;

-- CreateTable
CREATE TABLE "LabelApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "labelName" TEXT,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "LabelApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelInvite" (
    "id" TEXT NOT NULL,
    "labelUserId" TEXT NOT NULL,
    "artistUserId" TEXT NOT NULL,
    "status" "LabelInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "LabelInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabelApplication_teamId_status_idx" ON "LabelApplication"("teamId", "status");

-- CreateIndex
CREATE INDEX "LabelApplication_userId_idx" ON "LabelApplication"("userId");

-- CreateIndex
CREATE INDEX "LabelInvite_artistUserId_status_idx" ON "LabelInvite"("artistUserId", "status");

-- CreateIndex
CREATE INDEX "LabelInvite_labelUserId_status_idx" ON "LabelInvite"("labelUserId", "status");

-- CreateIndex
CREATE INDEX "User_signedLabelId_idx" ON "User"("signedLabelId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_signedLabelId_fkey" FOREIGN KEY ("signedLabelId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelApplication" ADD CONSTRAINT "LabelApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelApplication" ADD CONSTRAINT "LabelApplication_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelApplication" ADD CONSTRAINT "LabelApplication_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelInvite" ADD CONSTRAINT "LabelInvite_labelUserId_fkey" FOREIGN KEY ("labelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelInvite" ADD CONSTRAINT "LabelInvite_artistUserId_fkey" FOREIGN KEY ("artistUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
