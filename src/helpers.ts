import { exec, spawn } from "child_process";
import "dotenv/config";
import fs from "fs";
import { MongoClient } from "mongodb";
import path from "path";
import { logger } from "./logger";

export const backupDir = path.join(__dirname, "..", "backups");
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

export function getConnections(): { name: string; uri: string }[] {
    return Object.keys(process.env)
        .filter((key) => key.startsWith("MONGO"))
        .map((key) => ({
            name: key,
            uri: process.env[key] as string,
        }));
}

export function getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
}

export function getBackedUpDBs(): string[] {
    return fs.readdirSync(backupDir);
}

export async function listDatabases(uri: string): Promise<string[]> {
    const client = new MongoClient(uri);

    await client.connect();
    const adminDb = client.db().admin();
    const result = await adminDb.listDatabases();
    await client.close();
    return result.databases.map((e) => e.name);
}

export async function runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        logger.debug(`Executing: ${command} ${args.join(" ")}`);

        const process = spawn(command, args, {
            shell: false,
        });

        process.stdout.on("data", (data) => {
            logger.debug(`[stdout] ${data.toString().trim()}`);
        });

        process.stderr.on("data", (data) => {
            logger.debug(`[stderr] ${data.toString().trim()}`);
        });

        process.on("close", (code) => {
            if (code === 0) {
                logger.info(`Command completed successfully.`);
                resolve();
            } else {
                logger.error(`Command exited with code ${code}`);
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        process.on("error", (err) => {
            logger.error(`Failed to start process: ${err.message}`);
            reject(err);
        });
    });
}
