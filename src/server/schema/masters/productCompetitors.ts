import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";
import { products } from "./products";

export const productCompetitors = mysqlTable('productCompetitors', {
    id: int().autoincrement().primaryKey(),
    competitorName: varchar({ length: 32 }).notNull(),
    competitorImage: text(),
    productID: int().references(() => products.id),
})