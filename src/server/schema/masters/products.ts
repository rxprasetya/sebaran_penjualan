import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const products = mysqlTable('products', {
    id: int().autoincrement().primaryKey(),
    productCode: varchar({ length: 8 }).notNull(),
    productName: varchar({ length: 32 }).notNull(),
    productImage: text(),
})