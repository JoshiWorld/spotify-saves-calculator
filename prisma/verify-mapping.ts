import { Redis } from "@upstash/redis";
import * as fs from "fs/promises";

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const mongoUserEmailToPostgresIdMap = new Map<string, string>();
const mongoLinkSlugToPostgresIdMap = new Map<string, string>();
const mongoLinkIdToPostGresIdMap = new Map<string, string>();
const mongoLinkIds: string[] = [];

async function verifyMapping() {
    try {
        console.log("Verifying ID mappings...");

        // Lade die exportierten MongoDB-Daten
        const mongoUsers = JSON.parse(await fs.readFile("export/mongodb_users.json", "utf-8"));
        const mongoLinks = JSON.parse(await fs.readFile("export/mongodb_links.json", "utf-8"));

        // Lade die exportierten PostgreSQL-Daten
        const postgresUsers = JSON.parse(await fs.readFile("export/postgresql_users.json", "utf-8"));
        const postgresLinks = JSON.parse(await fs.readFile("export/postgresql_links.json", "utf-8"));

        for (const pgUser of postgresUsers) {
            mongoUserEmailToPostgresIdMap.set(pgUser.email, pgUser.id);
        }

        for (const pgLink of postgresLinks) {
            mongoLinkSlugToPostgresIdMap.set(pgLink.name, pgLink.id);
        }




        console.log("\n--- User ID Mapping ---");
        for (const mongoUser of mongoUsers) {
            const oldMongoId = mongoUser._id.$oid || mongoUser._id;
            const email = mongoUser.email;
            const newPostgresId = mongoUserEmailToPostgresIdMap.get(email);
            if (newPostgresId) {
                console.log(`User: ${email} - Old Mongo ID: ${oldMongoId} -> New Postgres ID: ${newPostgresId}`);
            } else {
                console.warn(`Warning: User ${email} (Mongo ID: ${oldMongoId}) not found in PostgreSQL export!`);
            }
        }




        console.log("\n--- Link ID Mapping ---");
        for (const mongoLink of mongoLinks) {
            const oldMongoId = mongoLink._id.$oid || mongoLink._id;
            const name = mongoLink.name;
            const newPostgresId = mongoLinkSlugToPostgresIdMap.get(name);
            if (newPostgresId) {
                mongoLinkIds.push(oldMongoId);
                mongoLinkIdToPostGresIdMap.set(oldMongoId, newPostgresId);
                console.log(`Link: ${name} - Old Mongo ID: ${oldMongoId} -> New Postgres ID: ${newPostgresId}`);
            } else {
                console.warn(`Warning: Link ${name} (Mongo ID: ${oldMongoId}) not found in PostgreSQL export!`);
            }
        }

        console.log("\nID Mapping verification complete.");

    } catch (error) {
        console.error("Error during ID mapping verification:", error);
    }
}

async function migrateRedisLinkStats() {
    console.log("Starting Redis Link Stats migration...");

    return;

    try {
        for (const mongoLinkId of mongoLinkIds) {
            const keyPattern = `stats:${mongoLinkId}:*`;
            const keys = await redis.keys(keyPattern);
            const postgresLinkId = mongoLinkIdToPostGresIdMap.get(mongoLinkId);
            for (const key of keys) {
                const keySplitted = key.split(':');
                const newKey = `stats:${postgresLinkId}:${keySplitted[2]}:${keySplitted[3]}`;
                const data = await redis.hgetall<{
                    clicks: string | null | undefined;
                    visits: string | null | undefined;
                }>(key);

                console.log(`KEYS: ${key} vs ${newKey}:`, data);

                await redis.hset(newKey, {
                    clicks: data?.clicks ?? 0,
                    visits: data?.visits ?? 0,
                });
            }
        }
    } catch (err) {
        console.error(err);
    }

    // do {
    //     // Hole alle Keys, die mit 'stats:' beginnen (dein Muster für Link-Stats)
    //     const [nextCursor, keys] = await redis.scan(cursor, { match: "stats:*", count: 100 });
    //     cursor = nextCursor;

    //     for (const oldKey of keys) {
    //         // Annahme: Key-Format ist "stats:<link_id>:<date>"
    //         const parts = oldKey.split(':');
    //         if (parts.length < 4 || parts[0] !== 'stats') {
    //             console.warn(`Skipping malformed Redis key: ${oldKey}`);
    //             skippedCount++;
    //             continue;
    //         }
    //         const oldLinkIdMongo = parts[1]; // Die alte MongoDB Link ID
    //         const statsVersion = parts[2];
    //         const dateSuffix = parts[3];

    //         const newPostgresLinkId = mongoLinkIdToPostGresIdMap.get(oldLinkIdMongo);

    //         if (!newPostgresLinkId) {
    //             console.warn(`New PostgreSQL Link ID not found for old Mongo Link ID ${oldLinkIdMongo} (from key ${oldKey}). Skipping.`);
    //             skippedCount++;
    //             continue;
    //         }

    //         const newKey = `stats:${newPostgresLinkId}:${statsVersion}:${dateSuffix}`;
    //         console.log(`Old-Redis: '${oldKey}' - New-Redis: '${newKey}'`);

    //         // // Überprüfen, ob der neue Key bereits existiert (falls du mehrere Läufe machst)
    //         // const newKeyExists = await redis.exists(newKey);
    //         // if (newKeyExists) {
    //         //     console.log(`Skipping migration for ${oldKey} to ${newKey}: new key already exists.`);
    //         //     skippedCount++;
    //         //     continue; // Überspringen, da wir die alten Keys behalten wollen
    //         // }

    //         // // Daten für den Hash kopieren
    //         // const hashData = await redis.hgetall(oldKey);

    //         // if (Object.keys(hashData).length > 0) { // Nur kopieren, wenn der Hash Daten enthält
    //         //     await redis.hmset(newKey, hashData as Record<string, string>); // Typ-Assertion, da HGETALL ein Record<string, string> zurückgibt
    //         //     console.log(`Migrated Redis Hash key from ${oldKey} to ${newKey}`);
    //         //     migratedCount++;
    //         // } else {
    //         //     console.log(`Redis Hash key ${oldKey} was empty. Skipping copy.`);
    //         //     skippedCount++;
    //         // }
    //     }
    // } while (cursor !== 0);

    // console.log(`Redis Link Stats migration complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}.`);
}

verifyMapping().then(async () => {
    await migrateRedisLinkStats();
}).catch((err) => console.error(err));