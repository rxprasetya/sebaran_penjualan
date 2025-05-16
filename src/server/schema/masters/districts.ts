import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { provinces } from "./provinces";
import { cities } from "./cities";

export const districts = mysqlTable('districts', {
    id: int().autoincrement().primaryKey(),
    districtCode: varchar({ length: 16 }).notNull(),
    districtName: varchar({ length: 32 }).notNull(),
    provinceID: int().references(() => provinces.id),
    cityID: int().references(() => cities.id)
})