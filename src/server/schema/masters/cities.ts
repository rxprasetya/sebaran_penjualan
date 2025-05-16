import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { provinces } from "./provinces";

export const cities = mysqlTable('cities', {
    id: int().autoincrement().primaryKey(),
    cityCode: varchar({ length: 16 }).notNull(),
    cityName: varchar({ length: 32 }).notNull(),
    provinceID: int().references(() => provinces.id)
})