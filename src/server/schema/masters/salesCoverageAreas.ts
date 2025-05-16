import { bigint, int, mysqlTable } from "drizzle-orm/mysql-core";
import { provinces } from "./provinces";
import { cities } from "./cities";
import { districts } from "./districts";
import { villages } from "./villages";
import { employees } from "./employees";

export const salesCoverageAreas = mysqlTable('salesCoverageAreas', {
    id: int().autoincrement().primaryKey(),
    employeeID: int().references(() => employees.id),
    provinceID: int().references(() => provinces.id),
    cityID: int().references(() => cities.id),
    districtID: int().references(() => districts.id),
    villageID: int().references(() => villages.id),
})