import express, { Request, Response } from "express";
import db from "../config/db"
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import multer from "multer";
import { employees } from "../schema";
import { and, eq, ne } from "drizzle-orm";
import { body, validationResult } from 'express-validator'

const employeeRouter = express.Router();
const apiEmployees = '/api/employees/'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, '../uploads');
const uploadEmployeesPath = path.join(uploadFolder, 'employees');

if (!fs.existsSync(uploadEmployeesPath)) fs.mkdirSync(uploadEmployeesPath, { recursive: true });

const storageEmployees = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadEmployeesPath),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});

const uploadEmployeeImage = multer({ storage: storageEmployees });

// Employee
employeeRouter.get(apiEmployees, async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(employees)
        res.status(200).json({ status: true, message: 'List Employees Data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

employeeRouter.get(apiEmployees + 'search/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const data = await db.select().from(employees).where(eq(employees.id, id))
        if (data.length === 0) res.status(404).json({ status: false, message: 'Data Not Found!' })
        res.status(200).json({ status: true, message: 'Found it', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

employeeRouter.get(apiEmployees + 'leader', async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(employees).where(ne(employees.employeePosition, 'Sales'))
        res.status(200).json({ status: true, message: 'List Leaders Data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

employeeRouter.post(apiEmployees + "create", uploadEmployeeImage.single("employeeImage"), [
    body('employeeCode')
        .isLength({ max: 8 }).withMessage('Code has max length is 8')
        .notEmpty().withMessage('Code is required'),
    body('employeeName').notEmpty().withMessage('Name is required'),
    body('employeePosition').notEmpty().withMessage('Position is required'),
], async (req: Request, res: Response) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return res.status(422).json({ status: false, errors: error.array() })
    }

    const fileUrl = req.file ? `/uploads/employees/${req.file.filename}` : null;
    const employeeColor = req.body.employeeColor || null;
    const employeeParentID = req.body.employeeParentID ? parseInt(req.body.employeeParentID, 10) : null;
    const { employeeCode, employeeName, employeePosition } = req.body;

    const data = {
        employeeCode,
        employeeName,
        employeePosition,
        employeeImage: fileUrl,
        employeeColor,
        employeeParentID
    };

    try {
        // Cek apakah employeeCode dan employeeName sudah ada
        const existing = await db
            .select()
            .from(employees)
            .where(eq(employees.employeeCode, employeeCode));

        if (existing.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Employee with the same code already exists. Please use different values.",
            });
        }

        await db.insert(employees).values(data);
        res.status(200).json({ status: true, message: "Successfully added employee", data });
    } catch (error: any) {
        res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
    }
});

employeeRouter.patch(apiEmployees + 'update/:id', uploadEmployeeImage.single('employeeImage'), [
    body('employeeCode')
        .isLength({ max: 8 }).withMessage('Code has max length is 8')
        .notEmpty().withMessage('Code is required'),
    body('employeeName').notEmpty().withMessage('Name is required'),
    body('employeePosition').notEmpty().withMessage('Position is required'),
], async (req: Request, res: Response) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return res.status(422).json({ status: false, errors: error.array() })
    }

    const id = parseInt(req.params.id);
    const fileUrl = req.file ? `/uploads/employees/${req.file.filename}` : null;
    const employeeColor = req.body.employeeColor || null;
    const employeeParentID = req.body.employeeParentID ? parseInt(req.body.employeeParentID, 10) : null;
    const { employeeCode, employeeName, employeePosition } = req.body;

    try {
        // Check for duplicate employeeCode or employeeName (excluding current employee)
        const duplicates = await db
            .select()
            .from(employees)
            .where(
                and(
                    eq(employees.employeeCode, employeeCode),
                    ne(employees.id, id)
                )
            );

        if (duplicates.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Employee with the same code already exists. Please use different values.",
            });
        }

        const [oldEmployee] = await db.select().from(employees).where(eq(employees.id, id));

        const updateData: any = {
            employeeCode,
            employeeName,
            employeePosition,
            employeeColor,
            employeeParentID
        };

        if (fileUrl) {
            if (oldEmployee?.employeeImage) {
                const oldFilePath = path.join(__dirname, '../..', 'server/uploads/employees', path.basename(oldEmployee.employeeImage));
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            updateData.employeeImage = fileUrl;
        }

        await db.update(employees).set(updateData).where(eq(employees.id, id));
        res.status(200).json({ status: true, message: 'Successfully updated employee', updateData });
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error: ' + error.message });
    }
});

employeeRouter.delete(apiEmployees + 'delete/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const [employee] = await db.select().from(employees).where(eq(employees.id, id));

        if (employee?.employeeImage) {
            const filePath = path.join(__dirname, '../..', 'server/uploads/employees', path.basename(employee.employeeImage));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.delete(employees).where(eq(employees.id, id));
        res.status(200).json({ status: true, message: 'Successfully deleted employee' });
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error: ' + error.message });
    }
});

employeeRouter.use('/uploads', express.static(uploadFolder));

export default employeeRouter