import { bigint, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { provinces } from "./provinces";
import { cities } from "./cities";
import { districts } from "./districts";

export const villages = mysqlTable('villages', {
    id: int().autoincrement().primaryKey(),
    villageCode: varchar({ length: 16 }).notNull(),
    villageName: varchar({ length: 32 }).notNull(),
    provinceID: int().references(() => provinces.id),
    cityID: int().references(() => cities.id),
    districtID: int().references(() => districts.id),
})