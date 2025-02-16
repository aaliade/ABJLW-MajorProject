import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from 'dotenv';
import * as actions from './actions';
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export { db };

async function main() {
    try {
        // TESTING QUERIES

        // CREATE OPERATIONS

        // actions.createUser(
        //     'John Doe',
        //     'johndoe@example.com'
        // );

        // actions.createReport(
        //     1,
        //     '123 Main St',
        //     'Paper',
        //     '10',
        //     'https://example.com/paper.jpg',
        //     '{}',
        //     'pending'
        // );

        // actions.createReward(
        //     1,
        //     100,
        //     1,
        //     'Points towards purchasing groceries',
        //     'Grocery Points',
        //     'Collection Info'
        // );

        // actions.createCollectedWaste(
        //     2,
        //     1,
        //     new Date(),
        //     'pending'
        // );

        // actions.createTransaction(
        //     1,
        //     'earned',
        //     100,
        //     'Grocery Points',
        //     new Date()
        // );

        // actions.createNotification(
        //     1,
        //     'Your reward has been redeemed',
        //     'reward',
        //     false,
        //     new Date()
        // );

        // READ OPERATIONS

        // actions.readUsers();
        // console.log('\n');
        // actions.readUser(1);
        // console.log('\n');

        // actions.readReports();
        // console.log('\n');
        // actions.readReport(2);
        // console.log('\n');

        // actions.readRewards();
        // console.log('\n');
        // actions.readReward(2);
        // console.log('\n');

        // actions.readCollectedWastes();
        // console.log('\n');
        // actions.readCollectedWaste(4);


        // actions.readTransactions();
        // console.log('\n');
        // actions.readTransaction(2);
        // console.log('\n');

        // actions.readNotifications();
        // console.log('\n');
        // actions.readNotification(2);
        // console.log('\n');

        // UPDATE OPERATIONS

        // actions.updateUser(
        //     1,
        //     'John Doe',
        //     'johndoe@example.com'
        // );

        // actions.updateReport(
        //     2,
        //     'pending'
        // );

        // actions.updateReward(
        //     2,
        //     100,
        //     1,
        //     'Points towards purchasing groceries',
        //     'Grocery Points',
        //     'Collection Info'    
        // );

        // actions.updateCollectedWaste(
        //     4,
        //     'collected'
        // );

        // actions.updateTransaction(
        //     2,
        //     100,
        //     'Grocery Points'
        // );

        // actions.updateNotification(
        //     2,
        //     'Your reward has been redeemed',
        //     'reward',
        //     false
        // );

        // DELETE OPERATIONS

        // actions.deleteUser(1);
        // actions.deleteReport(2);
        // actions.deleteReward(2);
        // actions.deleteCollectedWaste(4);
        // actions.deleteTransaction(2);
        // actions.deleteNotification(2);

        // actions.deleteUsers();
        // actions.deleteReports();
        // actions.deleteRewards();
        // actions.deleteCollectedWastes();
        // actions.deleteTransactions();
        // actions.deleteNotifications();

    } catch (error) {
        console.error('Error connecting to database: ', error);
        // Exit process with failure
        process.exit(1);
    }
}

main();
