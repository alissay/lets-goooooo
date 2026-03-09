-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('STANDARD', 'CAREER');

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "goalType" "GoalType" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EvidenceLog" (
    "id" TEXT NOT NULL,
    "entry" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,

    CONSTRAINT "EvidenceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvidenceLog_userId_loggedAt_idx" ON "EvidenceLog"("userId", "loggedAt");

-- AddForeignKey
ALTER TABLE "EvidenceLog" ADD CONSTRAINT "EvidenceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLog" ADD CONSTRAINT "EvidenceLog_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
