import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable('users', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 64 }).notNull(),
    username: varchar({ length: 32 }).notNull(),
    password: varchar({ length: 64 }).notNull()
})