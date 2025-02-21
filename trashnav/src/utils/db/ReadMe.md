### Database Setup
```
npm i drizzle-orm @neondatabase/serverless dotenv
npm i -D drizzle-kit tsx
npm i dotenv
```

Get the connection string from drizzle, then create a file at the root level called .env.local.
Inside create a variable called DATABASE_URL and paste the string. 
Example:
```
DATABASE_URL="postgresql://neondb_owner:[password]@ep-fancy-tooth-a8c1ht2x.eastus2.azure.neon.tech/neondb?sslmode=require"
```

Making Queries to the database is down by called methods from:
```
trashnav\src\utils\db\actions.ts
```

First import:
```
import * as actions from './actions';
```

#### Creation operations
Storing new users - name, email
```
actions.createUser('John Doe', 'johndoe@example.com'); 
```

Storing new reports - userId, address, longitude, latitude, wasteType, amount, collectorId

```
actions.createReport(1, '123 Main St', -76.792, 18.018, 'Plastic', '5 kg', 'https://example.com/plastic.jpg', '{}', 'pending', 2);
```

Storing new Rewards - rewardId, points, level, description, name, collectionInfo
```
actions.createReward(1, 100, 1, 'Points for groceries', 'Grocery Points', 'Pick up at local store');
```
Storing new Collected Wastes - collectedWasteId, reportId, date, status

```
actions.createCollectedWaste(1, 1, new Date(), 'collected');
```
OR
```
// new Date(2025, 2, 16) -> year, month, day

actions.createCollectedWaste(5, 5, new Date(2025, 2, 16), 'pending');

```

Storing new Transactions - transactionId, type, amount, description, date

```
actions.createTransaction(1, 'earned', 100, 'Grocery Points', new Date());
```

Storing new Notifications - notificationId, userId, message, type, isRead, createdAt

```
actions.createNotification(1, 'Your reward has been redeemed', 'reward', false, new Date());
```

#### Read operations
Fetch queries returns a list of objects in JSON format.

```
// Get all users
actions.getAllUsers();

// Get a single user by ID
actions.getUserById(1);

// Get all reports
actions.getAllReports();

// Get a specific report by ID
actions.getReportById(3);

// Get all reports made by a specific user
actions.getReportsByUserId(2);

// Get all reports with a specific status
actions.getReportsByStatus('verified');

// Get all reports with a specific geographical coordinates
actions.getReportsCoordinatesByReportId(3);

// Get all rewards
actions.getAllRewards();

// Get a specific reward by ID
actions.getRewardById(4);

// Get rewards associated with a specific user
actions.getRewardsByUserId(1);

// Get all collected waste records
actions.getAllCollectedWastes();

// Get collected waste by ID
actions.getCollectedWasteById(2);

// Get collected waste associated with a specific report
actions.getCollectedWasteByReportId(3);

// Get all transactions
actions.getAllTransactions();

// Get a specific transaction by ID
actions.getTransactionById(5);

// Get all transactions for a specific user
actions.getTransactionsByUserId(1);

// Get all notifications
actions.getAllNotifications();

// Get a specific notification by ID
actions.getNotificationById(3);

// Get all unread notifications
actions.getUnreadNotifications();

// Get all notifications for a specific user
actions.getNotificationsByUserId(2);
```
#### Update operations
```
// Update user details
actions.updateUser(1, "John Doe", "john.doe@example.com");

// Update a report's status
actions.updateReportStatus(3, "verified");

// Update report details
actions.updateReport(1, 1, "123 Main St", 18.018, -76.792, "Plastic", "5 kg", "https://example.com/new-image.jpg", "{}", "pending");

// Update reward details
actions.updateReward(4, 500, 3, "New reward description", "New Reward", "New collection info");

// Update a collected waste entry
actions.updateCollectedWaste(2, "in transit");

// Update a transaction status (e.g., pending → completed)
actions.updateTransactionStatus(5, "completed");

// Update transaction details (e.g., amount, type)
actions.updateTransaction(5, 150, "withdrawal");

// Mark a notification as read
actions.updateNotificationStatus(3, true);

// Update notification content (if needed)
actions.updateNotification(3, "Updated notification message", "notification", false);
```
#### Delete operations
```
// Delete a user by ID
actions.deleteUser(1);

// Delete a report by ID
actions.deleteReport(3);

// Delete a reward by ID
actions.deleteReward(4);

// Delete a collected waste entry by ID
actions.deleteCollectedWasteById(2);

// Delete a transaction by ID
actions.deleteTransactionById(5);

// Delete a notification by ID
actions.deleteNotification(3);

// Delete all notifications for a user
actions.deleteAllNotificationsForUser(1);

// Delete all reports for a specific user
actions.deleteReportsByUser(1);

// Delete all collected waste records for a specific user
actions.deleteCollectedWasteByReportId(1);

// Delete all transactions for a specific user
actions.deleteTransactionsByUser(1);
```

### Camera Setup
```
npm install react-webcam
```

#### Schema
_Stored in src/utils folder_

