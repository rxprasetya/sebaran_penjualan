import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    out: './drizzle',
    schema: './src/server/schema/index.ts',
    dialect: 'mysql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    }
}) 