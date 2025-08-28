/*
  Warnings:

  - Made the column `enabled` on table `Link` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Link" ALTER COLUMN "enabled" SET NOT NULL;
