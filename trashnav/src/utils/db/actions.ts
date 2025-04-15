import {
  Users,
  Reports,
  Rewards,
  CollectedWastes,
  Notifications,
  Transactions,
} from "./schema";
import { db } from "./index";

import { eq } from "drizzle-orm";

// CREATE OPERATIONS

// Create a new user
export async function createUser(name: string, email: string) {
  try {
    const user: typeof Users.$inferInsert = {
      name: name,
      email: email,
      createdAt: new Date(),
    };

    await db.insert(Users).values(user);
    console.log("New user created!");
  } catch (error) {
    console.log("Error creating user: " + error);
  }
}

// Create a new report
export async function createReport(
  userId: number,
  address: string,
  longitude: number,
  latitude: number,
  wasteType: string,
  amount: string,
) {
  try {
    const report: typeof Reports.$inferInsert = {
      userId: userId,
      address: address,
      longitude: longitude,
      latitude: latitude,
      wasteType: wasteType,
      amount: amount,
      createdAt: new Date(),
    };

    await db.insert(Reports).values(report);
    console.log("New report created!");
  } catch (error) {
    console.log("Error creating report: " + error);
  }
}

// Create a new reward
export async function createReward(
  userId: number,
  points: number,
  level: number,
  description: string,
  name: string,
  collectionInfo: string
) {
  try {
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
    console.log("New reward created!");
  } catch (error) {
    console.log("Error creating reward: " + error);
  }
}

// Create a new collected waste
export async function createCollectedWaste(
  reportId: number,
  collectorId: number,
  collectionDate: Date,
  status: string
) {
  try {
    const collectedWaste: typeof CollectedWastes.$inferInsert = {
      reportId: reportId,
      collectorId: collectorId,
      collectionDate: collectionDate,
      status: status,
    };

    await db.insert(CollectedWastes).values(collectedWaste);
    console.log("New collected waste created!");
  } catch (error) {
    console.log("Error creating collected waste: " + error);
  }
}

// Create a new transaction
export async function createTransaction(
  userId: number,
  type: string,
  amount: number,
  description: string,
  date: Date
) {
  try {
    const transaction: typeof Transactions.$inferInsert = {
      userId: userId,
      type: type,
      amount: amount,
      description: description,
      date: date,
    };

    await db.insert(Transactions).values(transaction);
    console.log("New transaction created!");
  } catch (error) {
    console.log("Error creating transaction: " + error);
  }
}

// Create a new notification
export async function createNotification(
  userId: number,
  message: string,
  type: string,
  isRead: boolean,
  createdAt: Date
) {
  try {
    const notification: typeof Notifications.$inferInsert = {
      userId: userId,
      message: message,
      type: type,
      isRead: isRead,
      createdAt: createdAt,
    };

    await db.insert(Notifications).values(notification);
    console.log("New notification created!");
  } catch (error) {
    console.log("Error creating notification: " + error);
  }
}

// READ OPERATIONS

// Read all users
export async function getAllUsers() {
  try {
    const users = await db.select().from(Users);
    return users;
  } catch (error) {
    console.log("Error reading users: " + error);
    return null;
  }
}

// Read single user
export async function getUserById(userEmail: string) {
  try {
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.email, userEmail));
    return user;
  } catch (error) {
    console.log("Error reading user: " + error);
    return null;
  }
}

// Read single user
export async function getUserId(userEmail: string) {
  try {
    const user = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.email, userEmail));
    return user[0].id;
  } catch (error) {
    console.log("Error reading user: " + error);
    return null;
  }
}

// Read all reports
export async function getAllReports() {
  try {
    const reports = await db.select().from(Reports);
    return reports;
  } catch (error) {
    console.log("Error reading reports: " + error);
    return null;
  }
}

export async function getReportById(reportId: number) {
  try {
    const report = await db
      .select()
      .from(Reports)
      .where(eq(Reports.id, reportId))
      .limit(1);
    return report[0];
  } catch (error) {
    console.log("Error reading report: " + error);
    return null;
  }
}

export async function getReportsByUserId(userId: number) {
  try {
    const reports = await db
      .select()
      .from(Reports)
      .where(eq(Reports.userId, userId));
    return reports;
  } catch (error) {
    console.log("Error reading reports for user: " + error);
    return null;
  }
}

export async function getReportsByStatus(status: string) {
  try {
    const reports = await db
      .select()
      .from(Reports)
      .where(eq(Reports.status, status));
    return reports;
  } catch (error) {
    console.log("Error reading reports by status: " + error);
    return null;
  }
}

export async function getReportsCoordinatesByReportId(reportId: number) {
  try {
    const reportCoordinates = await db
      .select({
        longitude: Reports.longitude,
        latitude: Reports.latitude,
      })
      .from(Reports)
      .where(eq(Reports.id, reportId));

    return reportCoordinates;
  } catch (error) {
    console.log("Error getting report geographical coordinates: " + error);
    return null;
  }
}

// Read all rewards
export async function getAllRewards() {
  try {
    const rewards = await db.select().from(Rewards);
    return rewards;
  } catch (error) {
    console.log("Error reading rewards: " + error);
    return null;
  }
}

// Read single reward
export async function getRewardById(rewardId: number) {
  try {
    const reward = await db
      .select()
      .from(Rewards)
      .where(eq(Rewards.id, rewardId))
      .limit(1);
    return reward[0];
  } catch (error) {
    console.log("Error reading reward: " + error);
    return null;
  }
}

export async function getRewardsByUserId(rewardId: number) {
  try {
    const rewards = await db
      .select()
      .from(Rewards)
      .where(eq(Rewards.id, rewardId));
    return rewards;
  } catch (error) {
    console.log("Error reading reward: " + error);
    return null;
  }
}

// Read all collected wastes
export async function getAllCollectedWastes() {
  try {
    const collectedWastes = await db.select().from(CollectedWastes);
    return collectedWastes;
  } catch (error) {
    console.log("Error reading collected wastes: " + error);
    return null;
  }
}

// Read single collected waste
export async function getCollectedWasteById(collectedWasteId: number) {
  try {
    const collectedWaste = await db
      .select()
      .from(CollectedWastes)
      .where(eq(CollectedWastes.id, collectedWasteId));
    return collectedWaste;
  } catch (error) {
    console.log("Error reading collected waste: " + error);
    return null;
  }
}

// Read collected waste associated with a specific report
export async function getCollectedWasteByReportId(reportId: number) {
  try {
    const collectedWaste = await db
      .select()
      .from(CollectedWastes)
      .where(eq(CollectedWastes.reportId, reportId));
    return collectedWaste;
  } catch (error) {
    console.log("Error reading collected waste: " + error);
    return null;
  }
}

// Read all transactions
export async function getAllTransactions() {
  try {
    const transactions = await db.select().from(Transactions);
    return transactions;
  } catch (error) {
    console.log("Error reading transactions: " + error);
    return null;
  }
}

// Read single transaction
export async function getTransactionById(transactionId: number) {
  try {
    const transaction = await db
      .select()
      .from(Transactions)
      .where(eq(Transactions.id, transactionId));
    return transaction;
  } catch (error) {
    console.error("Error reading transaction: " + error);
    return null;
  }
}

// Read all transactions for a specific user
export async function getTransactionsByUserId(userId: number) {
  try {
    const transaction = await db
      .select()
      .from(Transactions)
      .where(eq(Transactions.userId, userId));
    return transaction;
  } catch (error) {
    console.error("Error reading transaction: " + error);
    return null;
  }
}

// Read all notifications
export async function getAllNotifications() {
  try {
    const notifications = await db.select().from(Notifications);
    return notifications;
  } catch (error) {
    console.error("Error reading notifications: " + error);
    return null;
  }
}

// Read single notification
export async function getNotificationById(notificationId: number) {
  try {
    const notification = await db
      .select()
      .from(Notifications)
      .where(eq(Notifications.id, notificationId));
    return notification;
  } catch (error) {
    console.error("Error reading notification: " + error);
    return null;
  }
}

// Read all unread notifications
export async function getUnreadNotifications() {
  try {
    const notifications = await db
      .select()
      .from(Notifications)
      .where(eq(Notifications.isRead, false));
    return notifications;
  } catch (error) {
    console.error("Error reading unread notifications: " + error);
    return null;
  }
}

// Read all notifications for a user
export async function getNotificationsByUserId(userId: number) {
  try {
    const notifications = await db
      .select()
      .from(Notifications)
      .where(eq(Notifications.userId, userId));
    return notifications;
  } catch (error) {
    console.error("Error reading notifications for user: " + error);
    return null;
  }
}

// UPDATE OPERATIONS

// Update user
export async function updateUser(userId: number, name: string, email: string) {
  try {
    await db
      .update(Users)
      .set({ name: name, email: email })
      .where(eq(Users.id, userId));
    console.log("User updated!");
  } catch (error) {
    console.log("Error updating user: " + error);
  }
}

// Update report status
export async function updateReportStatus(reportId: number, status: string) {
  try {
    await db
      .update(Reports)
      .set({ status: status })
      .where(eq(Reports.id, reportId));
    console.log("Report updated!");
  } catch (error) {
    console.log("Error updating report: " + error);
  }
}

// Update report
export async function updateReport(
  reportId: number,
  userId: number,
  address: string,
  latitude: number,
  longitude: number,
  wasteType: string,
  amount: string,
  imageUrl: string,
  verificationResult: string,
  status: string
) {
  try {
    await db
      .update(Reports)
      .set({
        userId: userId,
        address: address,
        latitude: latitude,
        longitude: longitude,
        wasteType: wasteType,
        amount: amount,
        status: status,
      })
      .where(eq(Reports.id, reportId));
    console.log("Report updated!");
  } catch (error) {
    console.log("Error updating report: " + error);
  }
}

// Update reward
export async function updateReward(
  rewardId: number,
  points: number,
  level: number,
  description: string,
  name: string,
  collectionInfo: string
) {
  try {
    await db
      .update(Rewards)
      .set({
        points: points,
        level: level,
        description: description,
        name: name,
        collectionInfo: collectionInfo,
      })
      .where(eq(Rewards.id, rewardId));
    console.log("Reward updated!");
  } catch (error) {
    console.log("Error updating reward: " + error);
  }
}

// Update collected waste
export async function updateCollectedWaste(
  collectedWasteId: number,
  status: string
) {
  try {
    await db
      .update(CollectedWastes)
      .set({ status: status })
      .where(eq(CollectedWastes.id, collectedWasteId));
    console.log("Collected waste updated!");
  } catch (error) {
    console.log("Error updating collected waste: " + error);
  }
}

// Update transaction
export async function updateTransaction(
  transactionId: number,
  amount: number,
  description: string
) {
  try {
    await db
      .update(Transactions)
      .set({ amount: amount, description: description })
      .where(eq(Transactions.id, transactionId));
    console.log("Transaction updated!");
  } catch (error) {
    console.log("Error updating transaction: " + error);
  }
}

// Update transaction status
export async function updateTransactionStatus(
  transactionId: number,
  status: string
) {
  try {
    await db
      .update(Transactions)
      .set({ status: status })
      .where(eq(Transactions.id, transactionId));
    console.log("Transaction status updated!");
  } catch (error) {
    console.log("Error updating transaction status: " + error);
  }
}

// Update notification
export async function updateNotification(
  notificationId: number,
  message: string,
  type: string,
  isRead: boolean
) {
  try {
    await db
      .update(Notifications)
      .set({ message: message, type: type, isRead: isRead })
      .where(eq(Notifications.id, notificationId));
    console.log("Notification updated!");
  } catch (error) {
    console.log("Error updating notification: " + error);
  }
}

// Update notification status
export async function updateNotificationStatus(
  notificationId: number,
  isRead: boolean
) {
  try {
    await db
      .update(Notifications)
      .set({ isRead: isRead })
      .where(eq(Notifications.id, notificationId));
    console.log("Notification status updated!");
  } catch (error) {
    console.log("Error updating notification status: " + error);
  }
}

// DELETE OPERATIONS

// Delete user
export async function deleteUser(userId: number) {
  try {
    await db.delete(Users).where(eq(Users.id, userId));
    console.log("User deleted!");
  } catch (error) {
    console.log("Error deleting user: " + error);
  }
}

// Delete all users
export async function deleteUsers() {
  try {
    await db.delete(Users);
    console.log("All users deleted!");
  } catch (error) {
    console.log("Error deleting users: " + error);
  }
}

// Delete report
export async function deleteReport(reportId: number) {
  try {
    await db.delete(Reports).where(eq(Reports.id, reportId));
    console.log("Report deleted!");
  } catch (error) {
    console.log("Error deleting report: " + error);
  }
}

// Delete all reports
export async function deleteReports() {
  try {
    await db.delete(Reports);
    console.log("All reports deleted!");
  } catch (error) {
    console.log("Error deleting reports: " + error);
  }
}

// Delete reward
export async function deleteReportsByUser(rewardId: number) {
  try {
    await db.delete(Rewards).where(eq(Rewards.id, rewardId));
    console.log("Reward deleted!");
  } catch (error) {
    console.log("Error deleting reward: " + error);
  }
}

// Delete all rewards
export async function deleteRewards() {
  try {
    await db.delete(Rewards);
    console.log("All rewards deleted!");
  } catch (error) {
    console.log("Error deleting rewards: " + error);
  }
}

// Delete reward
export async function deleteReward(rewardId: number) {
  try {
    await db.delete(Rewards).where(eq(Rewards.id, rewardId));
    console.log("Reward deleted!");
  } catch (error) {
    console.log("Error deleting reward: " + error);
  }
}

// Delete all collected wastes
export async function deleteCollectedWastes() {
  try {
    await db.delete(CollectedWastes);
    console.log("All collected wastes deleted!");
  } catch (error) {
    console.log("Error deleting collected wastes: " + error);
  }
}

// Delete collected waste by id
export async function deleteCollectedWasteById(collectedWasteId: number) {
  try {
    await db
      .delete(CollectedWastes)
      .where(eq(CollectedWastes.id, collectedWasteId));
    console.log("Collected waste deleted!");
  } catch (error) {
    console.log("Error deleting collected waste: " + error);
  }
}

// Delete collected waste by report id
export async function deleteCollectedWasteByReportId(reportId: number) {
  try {
    await db
      .delete(CollectedWastes)
      .where(eq(CollectedWastes.reportId, reportId));
    console.log("Collected waste deleted!");
  } catch (error) {
    console.log("Error deleting collected waste: " + error);
  }
}

// Delete all transactions
export async function deleteTransactions() {
  try {
    await db.delete(Transactions);
    console.log("All transactions deleted!");
  } catch (error) {
    console.log("Error deleting transactions: " + error);
  }
}

// Delete transaction
export async function deleteTransactionById(transactionId: number) {
  try {
    await db.delete(Transactions).where(eq(Transactions.id, transactionId));
    console.log("Transaction deleted!");
  } catch (error) {
    console.log("Error deleting transaction: " + error);
  }
}

// Delete all transactions for a user
export async function deleteTransactionsByUser(userId: number) {
  try {
    await db.delete(Transactions).where(eq(Transactions.userId, userId));
    console.log("All transactions for user deleted!");
  } catch (error) {
    console.log("Error deleting transactions for user: " + error);
  }
}

// Delete notification
export async function deleteNotification(notificationId: number) {
  try {
    await db.delete(Notifications).where(eq(Notifications.id, notificationId));
    console.log("Notification deleted!");
  } catch (error) {
    console.log("Error deleting notification: " + error);
  }
}

// Delete all notifications for a user
export async function deleteAllNotificationsForUser(userId: number) {
  try {
    await db.delete(Notifications).where(eq(Notifications.userId, userId));
    console.log(`All notifications for user ${userId} deleted!`);
  } catch (error) {
    console.log(`Error deleting notifications for user ${userId}: ` + error);
  }
}

// Delete all notifications
export async function deleteNotifications() {
  try {
    await db.delete(Notifications);
    console.log("All notifications deleted!");
  } catch (error) {
    console.log("Error deleting notifications: " + error);
  }
}
