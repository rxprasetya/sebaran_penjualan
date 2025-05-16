import { int, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const employees = mysqlTable('employees', {
    id: int().autoincrement().primaryKey(),
    employeeCode: varchar({ length: 8 }).notNull(),
    employeeName: varchar({ length: 32 }).notNull(),
    employeePosition: varchar({ length: 32 }).notNull(),
    employeeImage: text(),
    employeeColor: varchar({ length: 8 }),
    employeeParentID: int(),
})