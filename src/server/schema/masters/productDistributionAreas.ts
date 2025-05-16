import { int, mysqlTable } from "drizzle-orm/mysql-core";
import { provinces } from "./provinces";
import { cities } from "./cities";
import { districts } from "./districts";
import { villages } from "./villages";
import { products } from "./products";

export const productDistributionAreas = mysqlTable('productDistributionAreas', {
    id: int().autoincrement().primaryKey(),
    productID: int().references(() => products.id),
    provinceID: int().references(() => provinces.id),
    cityID: int().references(() => cities.id),
    districtID: int().references(() => districts.id),
    villageID: int().references(() => villages.id),
})