import { eq } from "drizzle-orm";
import db from "../config/db";
import { users } from "../schema/masters/users";
import CryptoJs from "crypto-js";

async function seed() {
    const existing = await db.select().from(users).where(eq(users.username, 'admin'));

    if (existing.length > 0) {
        console.log(' Data already seeded');
        return;
    }

    await db.insert(users).values({
        name: 'ZENISH',
        username: 'ZENISH',
        password: CryptoJs.AES.encrypt(JSON.stringify('ACC4ZENISH'), process.env.SECRET_KEY!).toString(),
    });

    console.log('Seed successful');
}

seed().catch((err) => {
    console.error('Seed error:', err);
});
