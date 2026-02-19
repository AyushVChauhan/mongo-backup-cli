import { input, select } from "@inquirer/prompts";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { logger } from "./logger";
import {
    backupDir,
    getBackedUpDBs,
    getConnections,
    getTimestamp,
    listDatabases,
    runCommand,
} from "./helpers";

async function backupDatabase(uri: string, dbName: string): Promise<void> {
    const timestamp = getTimestamp();
    const archivePath = path.join(
        backupDir,
        `${dbName}-${timestamp}.archive.gz`,
    );

    logger.info(`Starting backup for DB: ${dbName}`);
    logger.info(`Archive file: ${archivePath}`);

    await runCommand("mongodump", [
        `--uri="${uri}"`,
        `--db=${dbName}`,
        `--archive="${archivePath}"`,
        "--gzip",
    ]);

    logger.info("Backup completed successfully.");
}

async function restoreDatabase(
    uri: string,
    archiveFile: string,
    sourceDb: string,
    targetDb: string,
): Promise<void> {
    const archivePath = path.join(backupDir, archiveFile);

    logger.info(`Restoring archive: ${archiveFile}`);
    logger.info(`Renaming ${sourceDb} → ${targetDb}`);

    await runCommand("mongorestore", [
        `--uri=${uri}`,
        "--drop",
        "--gzip",
        `--archive=${archivePath}`,
        `--nsFrom=${sourceDb}.*`,
        `--nsTo=${targetDb}.*`,
    ]);

    logger.info("Restore completed successfully.");
}

async function main(): Promise<void> {
    try {
        const connections = getConnections();
        if (!connections.length) {
            logger.error("No DB connection strings found in .env");
            return;
        }

        const actions = {
            backup: "Backup",
            restore: "Restore",
        };

        const action = await select({
            message: "Choose an action:",
            choices: [actions.backup, actions.restore],
        });

        const connection = await select({
            message: "Select MongoDB connection:",
            choices: connections.map((c) => ({ name: c.name, value: c.uri })),
        });

        const dbs =
            action === actions.backup
                ? await listDatabases(connection)
                : getBackedUpDBs();
        const dbName = await select({
            message: "Select database:",
            choices: dbs,
        });

        if (action === "Backup") {
            await backupDatabase(connection, dbName);
        } else {
            const targetDb = await input({
                message: "Enter new DB name:",
                required: true,
            });
            await restoreDatabase(
                connection,
                dbName,
                dbName.slice(0, -11 - 25), // 11 = .archive.tz, 25 = '-' + timestamp
                targetDb,
            );
        }
    } catch (error: any) {
        logger.error(`Application error: ${error.message}`);
    }
}

main();
