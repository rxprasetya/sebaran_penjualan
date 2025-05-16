import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { provinces } from "./provinces";
import { cities } from "./cities";
import { districts } from "./districts";
import { villages } from "./villages";

export const retails = mysqlTable('retails', {
    id: int().autoincrement().primaryKey(),
    retailName: varchar({ length: 32 }).notNull(),
    provinceID: int().references(() => provinces.id),
    cityID: int().references(() => cities.id),
    districtID: int().references(() => districts.id),
    villageID: int().references(() => villages.id),
    address: text()
})