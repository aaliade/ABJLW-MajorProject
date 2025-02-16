import { Users, Reports, Rewards, CollectedWastes, Notifications, Transactions } from './schema';
import { db } from './index';

import { eq } from "drizzle-orm";

// CREATE OPERATIONS

// Create a new user
export async function createUser(name: string, email: string) {
    const user: typeof Users.$inferInsert = {
        name: name,
        email: email,
        createdAt: new Date(),
    };

    await db.insert(Users).values(user);
    console.log('New user created!');
}

// Create a new report
export async function createReport(userId: number, location: string, wasteType: string, amount: string, imageUrl: string, verificationResult: string, status: string) {
    const report: typeof Reports.$inferInsert = {
        userId: userId,
        location: location,
        wasteType: wasteType,
        amount: amount,
        imageUrl: imageUrl,
        verificationResult: verificationResult,
        status: status,
        createdAt: new Date(),
    };

    await db.insert(Reports).values(report);
    console.log('New report created!')
}

// Create a new reward
export async function createReward(userId: number, points: number, level: number, description: string, name: string, collectionInfo: string) {
    const reward: typeof Rewards.$inferInsert = {
        userId: userId,
        points: points,
        level: level,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAvailable: true,
        description: description,
        name: name,
        collectionInfo: collectionInfo,
    };

    await db.insert(Rewards).values(reward);
    console.log('New reward created!');
}

// Create a new collected waste
export async function createCollectedWaste(reportId: number, collectorId: number, collectionDate: Date, status: string) {
    const collectedWaste: typeof CollectedWastes.$inferInsert = {
        reportId: reportId,
        collectorId: collectorId,
        collectionDate: collectionDate,
        status: status,
    };

    await db.insert(CollectedWastes).values(collectedWaste);
    console.log('New collected waste created!')
}

// Create a new transaction
export async function createTransaction(userId: number, type: string, amount: number, description: string, date: Date) {
    const transaction: typeof Transactions.$inferInsert = {
        userId: userId,
        type: type,
        amount: amount,
        description: description,
        date: date,
    };

    await db.insert(Transactions).values(transaction);
    console.log('New transaction created!')
}

// Create a new notification
export async function createNotification(userId: number, message: string, type: string, isRead: boolean, createdAt: Date) {
    const notification: typeof Notifications.$inferInsert = {
        userId: userId,
        message: message,
        type: type,
        isRead: isRead,
        createdAt: createdAt,
    };

    await db.insert(Notifications).values(notification);
    console.log('New notification created!');
}

// READ OPERATIONS

// Read all users
export async function readUsers() {
    const users = await db.select().from(Users);
    console.log(users);
}

// Read single user
export async function readUser(userId: number) {
    const user = await db.select().from(Users).where(eq(Users.id, userId));
    console.log(user);
}

// Read all reports
export async function readReports() {
    const reports = await db.select().from(Reports);
    console.log(reports);
}

// Read single report
export async function readReport(reportId: number) {
    const report = await db.select().from(Reports).where(eq(Reports.id, reportId));
    console.log(report);
}

// Read all rewards
export async function readRewards() {
    const rewards = await db.select().from(Rewards);
    console.log(rewards);
}

// Read single reward
export async function readReward(rewardId: number) {
    const reward = await db.select().from(Rewards).where(eq(Rewards.id, rewardId));
    console.log(reward);
}

// Read all collected wastes
export async function readCollectedWastes() {
    const collectedWastes = await db.select().from(CollectedWastes);
    console.log(collectedWastes);
}

// Read single collected waste
export async function readCollectedWaste(collectedWasteId: number) {
    const collectedWaste = await db.select().from(CollectedWastes).where(eq(CollectedWastes.id, collectedWasteId));
    console.log(collectedWaste);
}

// Read all transactions
export async function readTransactions() {
    const transactions = await db.select().from(Transactions);
    console.log(transactions);
}

// Read single transaction
export async function readTransaction(transactionId: number) {
    const transaction = await db.select().from(Transactions).where(eq(Transactions.id, transactionId));
    console.log(transaction);
}

// Read all notifications
export async function readNotifications() {
    const notifications = await db.select().from(Notifications);
    console.log(notifications);
}

// Read single notification
export async function readNotification(notificationId: number) {
    const notification = await db.select().from(Notifications).where(eq(Notifications.id, notificationId));
    console.log(notification);
}

// UPDATE OPERATIONS

// Update user
export async function updateUser(userId: number, name: string, email: string) {
    await db.update(Users).set({ name: name, email: email }).where(eq(Users.id, userId));
    console.log('User updated!');
}

// Update report
export async function updateReport(reportId: number, status: string) {
    await db.update(Reports).set({ status: status }).where(eq(Reports.id, reportId));
    console.log('Report updated!');
}

// Update reward
export async function updateReward(rewardId: number, points: number, level: number, description: string, name: string, collectionInfo: string) {
    await db.update(Rewards).set({ points: points, level: level, description: description, name: name, collectionInfo: collectionInfo }).where(eq(Rewards.id, rewardId));
    console.log('Reward updated!');
}

// Update collected waste
export async function updateCollectedWaste(collectedWasteId: number, status: string) {
    await db.update(CollectedWastes).set({ status: status }).where(eq(CollectedWastes.id, collectedWasteId));
    console.log('Collected waste updated!');
}

// Update transaction
export async function updateTransaction(transactionId: number, amount: number, description: string) {
    await db.update(Transactions).set({ amount: amount, description: description }).where(eq(Transactions.id, transactionId));
    console.log('Transaction updated!');
}

// Update notification
export async function updateNotification(notificationId: number, message: string, type: string, isRead: boolean) {
    await db.update(Notifications).set({ message: message, type: type, isRead: isRead }).where(eq(Notifications.id, notificationId));
    console.log('Notification updated!');
}

// DELETE OPERATIONS

// Delete user
export async function deleteUser(userId: number) {
    await db.delete(Users).where(eq(Users.id, userId));
    console.log('User deleted!');
}

// Delete all users
export async function deleteUsers() {
    await db.delete(Users);
    console.log('All users deleted!');
}

// Delete report
export async function deleteReport(reportId: number) {
    await db.delete(Reports).where(eq(Reports.id, reportId));
    console.log('Report deleted!');
}

// Delete all reports
export async function deleteReports() {
    await db.delete(Reports);
    console.log('All reports deleted!');
}

// Delete reward
export async function deleteReward(rewardId: number) {
    await db.delete(Rewards).where(eq(Rewards.id, rewardId));
    console.log('Reward deleted!');
}

// Delete all rewards
export async function deleteRewards() {
    await db.delete(Rewards);
    console.log('All rewards deleted!');
}

// Delete collected waste
export async function deleteCollectedWaste(collectedWasteId: number) {
    await db.delete(CollectedWastes).where(eq(CollectedWastes.id, collectedWasteId));
    console.log('Collected waste deleted!');
}

// Delete all collected wastes
export async function deleteCollectedWastes() {
    await db.delete(CollectedWastes);
    console.log('All collected wastes deleted!');
}

// Delete transaction
export async function deleteTransaction(transactionId: number) {
    await db.delete(Transactions).where(eq(Transactions.id, transactionId));
    console.log('Transaction deleted!');
}

// Delete all transactions
export async function deleteTransactions() {
    await db.delete(Transactions);
    console.log('All transactions deleted!');
}

// Delete notification
export async function deleteNotification(notificationId: number) {
    await db.delete(Notifications).where(eq(Notifications.id, notificationId));
    console.log('Notification deleted!');
}

// Delete all notifications
export async function deleteNotifications() {
    await db.delete(Notifications);
    console.log('All notifications deleted!');
}
