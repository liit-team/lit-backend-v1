/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `Heart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Heart` DROP FOREIGN KEY `Heart_postId_fkey`;

-- DropForeignKey
ALTER TABLE `Heart` DROP FOREIGN KEY `Heart_userId_fkey`;

-- DropForeignKey
ALTER TABLE `PostTags` DROP FOREIGN KEY `PostTags_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `PostTags` DROP FOREIGN KEY `PostTags_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Posts` DROP FOREIGN KEY `Posts_userId_fkey`;

-- DropForeignKey
ALTER TABLE `React` DROP FOREIGN KEY `React_postId_fkey`;

-- DropForeignKey
ALTER TABLE `React` DROP FOREIGN KEY `React_userId_fkey`;

-- CreateIndex
CREATE UNIQUE INDEX `Heart_userId_postId_key` ON `Heart`(`userId`, `postId`);

-- CreateIndex
CREATE UNIQUE INDEX `Users_phone_key` ON `Users`(`phone`);

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostTags` ADD CONSTRAINT `PostTags_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostTags` ADD CONSTRAINT `PostTags_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `React` ADD CONSTRAINT `React_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `React` ADD CONSTRAINT `React_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Heart` ADD CONSTRAINT `Heart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Heart` ADD CONSTRAINT `Heart_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
