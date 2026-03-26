-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clubColor" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "teamId" TEXT,
    CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "pitchOption" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "recurringGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Participation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpectatorInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    CONSTRAINT "SpectatorInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpectatorInterest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_userId_bookingId_key" ON "Participation"("userId", "bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "SpectatorInterest_userId_bookingId_key" ON "SpectatorInterest"("userId", "bookingId");
