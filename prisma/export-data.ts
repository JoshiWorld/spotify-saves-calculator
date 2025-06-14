import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";

const prisma = new PrismaClient();

async function exportData() {
    try {
        console.log("Exporting User and Link data from PostgreSQL...");

        // Export Users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
        await fs.writeFile("export/postgresql_users.json", JSON.stringify(users, null, 2), "utf-8");
        console.log(`Exported ${users.length} users to postgresql_users.json`);

        // Export Links
        const links = await prisma.link.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        await fs.writeFile("export/postgresql_links.json", JSON.stringify(links, null, 2), "utf-8");
        console.log(`Exported ${links.length} links to postgresql_links.json`);

        console.log("Data export from PostgreSQL complete!");
    } catch (error) {
        console.error("Error during PostgreSQL data export:", error);
    } finally {
        await prisma.$disconnect();
    }
}

void exportData();