/*
  Warnings:

  - You are about to drop the column `userId` on the `Posts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,postId]` on the table `React` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `takenById` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Posts` DROP FOREIGN KEY `Posts_userId_fkey`;

-- AlterTable
ALTER TABLE `Heart` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `PostTags` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Posts` DROP COLUMN `userId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `takenById` BIGINT NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `React` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `React_userId_postId_key` ON `React`(`userId`, `postId`);

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_takenById_fkey` FOREIGN KEY (`takenById`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
