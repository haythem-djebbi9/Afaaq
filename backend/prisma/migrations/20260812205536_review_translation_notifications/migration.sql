-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('PENDING', 'APPROVED', 'NEEDS_CORRECTION');

-- CreateEnum
CREATE TYPE "DossierReviewStatus" AS ENUM ('PENDING', 'VALIDATED');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "extractedText" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE "section_reviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "status" "SectionStatus" NOT NULL DEFAULT 'PENDING',
    "remark" TEXT,
    "remarkFr" TEXT,
    "remarkAr" TEXT,
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossier_reviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "DossierReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dossier_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_cache" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "section_reviews_applicationId_section_key" ON "section_reviews"("applicationId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "dossier_reviews_applicationId_key" ON "dossier_reviews"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "translation_cache_hash_key" ON "translation_cache"("hash");

-- AddForeignKey
ALTER TABLE "section_reviews" ADD CONSTRAINT "section_reviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_reviews" ADD CONSTRAINT "section_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_reviews" ADD CONSTRAINT "dossier_reviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_reviews" ADD CONSTRAINT "dossier_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
