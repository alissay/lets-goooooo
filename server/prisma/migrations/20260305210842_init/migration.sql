-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('WORK', 'FITNESS', 'NUTRITION', 'HABITS', 'ADMIN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'DEFERRED');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'ACHIEVED', 'PAUSED');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('AMBIENT_DAILY', 'IN_THE_MOMENT');

-- CreateEnum
CREATE TYPE "FeelingState" AS ENUM ('CRASHED', 'ROUGH', 'OKAY', 'GOOD', 'ON_FIRE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "firstStep" TEXT,
    "domain" "Domain" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "urgencyLevel" INTEGER NOT NULL DEFAULT 0,
    "softDueAt" TIMESTAMP(3),
    "breadcrumb" TEXT,
    "isNowMode" BOOLEAN NOT NULL DEFAULT false,
    "nowModeEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "deferredAt" TIMESTAMP(3),
    "deferCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "domain" "Domain" NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeelingLog" (
    "id" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "state" "FeelingState" NOT NULL,
    "note" TEXT,
    "domainContext" "Domain",
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FeelingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "domain" "Domain",
    "feature" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");

-- CreateIndex
CREATE INDEX "Task_userId_domain_idx" ON "Task"("userId", "domain");

-- CreateIndex
CREATE INDEX "Goal_userId_domain_idx" ON "Goal"("userId", "domain");

-- CreateIndex
CREATE INDEX "FeelingLog_userId_loggedAt_idx" ON "FeelingLog"("userId", "loggedAt");

-- CreateIndex
CREATE INDEX "UsageEvent_userId_occurredAt_idx" ON "UsageEvent"("userId", "occurredAt");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeelingLog" ADD CONSTRAINT "FeelingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
