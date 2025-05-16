import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const provinces = mysqlTable('provinces', {
    id: int().autoincrement().primaryKey(),
    provinceCode: varchar({ length: 16 }).notNull(),
    provinceName: varchar({ length: 32 }).notNull()
})