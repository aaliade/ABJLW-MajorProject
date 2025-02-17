import { db } from "./index";
import { migrate } from "drizzle-orm/neon-http/migrator";

// Migrate the generated code SQL code to the neon database.
const main = async () => {
    try {

        await migrate(db, {
            migrationsFolder: "./src/utils/db/migrations",
        });
        console.log("Migrations complete");
    } catch (error) {
        console.error("Error during migrations: ", error);
        // Exit process with failure
        process.exit(1);
    }
};

main();
