import express, { Request, Response } from "express";
import db from "../config/db"
import { alias } from "drizzle-orm/mysql-core";
import { cities, districts, employees, provinces, salesCoverageAreas, villages } from "../schema";
import { and, eq, isNull, ne } from "drizzle-orm";
import multer from "multer";

const salesCoverageAreaRouter = express.Router();
const apiSalesCoverageAreas = '/api/salescoverageareas/'
const upload = multer()

// SalesCoverageAreas
salesCoverageAreaRouter.get(apiSalesCoverageAreas, async (req: Request, res: Response) => {
    try {
        const parentEmployee = alias(employees, "parentEmployee");

        const data = await db
            .select({
                id: salesCoverageAreas.id,
                name: employees.employeeName,
                employeeImage: employees.employeeImage,
                employeeColor: employees.employeeColor,
                employeeParent: parentEmployee.employeeName, // ini ambil dari parent
                province: provinces.provinceName,
                city: cities.cityName,
                districtID: salesCoverageAreas.districtID,
                districtCode: districts.districtCode,
                district: districts.districtName,
                village: villages.villageName,
            })
            .from(salesCoverageAreas)
            .innerJoin(employees, eq(salesCoverageAreas.employeeID, employees.id))
            .leftJoin(parentEmployee, eq(employees.employeeParentID, parentEmployee.id)) // self join
            .innerJoin(provinces, eq(salesCoverageAreas.provinceID, provinces.id))
            .innerJoin(cities, eq(salesCoverageAreas.cityID, cities.id))
            .innerJoin(districts, eq(salesCoverageAreas.districtID, districts.id))
            .leftJoin(villages, eq(salesCoverageAreas.villageID, villages.id))

        res.status(200).json({ status: true, message: 'List Sales Coverage Areas Data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

salesCoverageAreaRouter.get(apiSalesCoverageAreas + 'sales', async (req: Request, res: Response) => {
    try {
        const data = await db
            .select(
                {
                    id: employees.id,
                    code: employees.employeeCode,
                    name: employees.employeeName,
                })
            .from(employees)
            .where(eq(employees.employeePosition, 'Sales'))

        res.status(200).json({ status: true, message: 'List Employees Data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

salesCoverageAreaRouter.get(apiSalesCoverageAreas + 'search/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const data = await db
            .select({
                id: salesCoverageAreas.id,
                employeeID: salesCoverageAreas.employeeID,
                provinceID: salesCoverageAreas.provinceID,
                provinceName: provinces.provinceName,
                cityID: salesCoverageAreas.cityID,
                cityName: cities.cityName,
                districtID: salesCoverageAreas.districtID,
                districtName: districts.districtName,
                villageID: salesCoverageAreas.villageID,
                villageName: villages.villageName,
            })
            .from(salesCoverageAreas)
            .innerJoin(provinces, eq(salesCoverageAreas.provinceID, provinces.id))
            .innerJoin(cities, eq(salesCoverageAreas.cityID, cities.id))
            .innerJoin(districts, eq(salesCoverageAreas.districtID, districts.id))
            .leftJoin(villages, eq(salesCoverageAreas.villageID, villages.id))
            .where(eq(salesCoverageAreas.id, id));

        if (data.length === 0) {
            res.status(404).json({ status: false, message: 'Data Not Found!' });
        }

        // Convert BigInt fields to strings
        const dataWithStrings = data.map((item: any) => ({
            ...item,
            id: item.id.toString(),
            employeeID: item.employeeID.toString(),
            provinceID: item.provinceID.toString(),
            cityID: item.cityID.toString(),
            districtID: item.districtID.toString(),
            villageID: item.villageID ? item.villageID.toString() : '',
        }));

        res.status(200).json({ status: true, message: 'Found it', data: dataWithStrings });
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message });
    }
});


salesCoverageAreaRouter.post(apiSalesCoverageAreas + 'create', upload.none(), async (req: Request, res: Response) => {
    const employeeID = Number(req.body.employeeID);
    const provinceID = Number(req.body.provinceID);
    const cityID = Number(req.body.cityID);
    const districtID = Number(req.body.districtID);
    const villageID = Number(req.body.villageID);

    if ([employeeID, provinceID, cityID, districtID, villageID].some(isNaN)) {
        return res.status(422).json({ status: false, message: 'Unknown column NaN in field list' });
    }

    if (employeeID && provinceID && cityID && districtID && villageID) {
        try {
            // Check if the data already exists
            const existing = await db
                .select()
                .from(salesCoverageAreas)
                .where(
                    and(
                        eq(salesCoverageAreas.employeeID, employeeID),
                        eq(salesCoverageAreas.provinceID, provinceID),
                        eq(salesCoverageAreas.cityID, cityID),
                        eq(salesCoverageAreas.districtID, districtID),
                        villageID !== null
                            ? eq(salesCoverageAreas.villageID, villageID)
                            : isNull(salesCoverageAreas.villageID)
                    )
                );

            if (existing.length > 0) {
                return res.status(409).json({
                    status: false,
                    message: 'The sales coverage area already exists. Please provide different values.',
                });
            }

            const data = { employeeID, provinceID, cityID, districtID, villageID };
            await db.insert(salesCoverageAreas).values(data);

            return res.status(200).json({
                status: true,
                message: 'Successfully added sales coverage area',
                data,
            });
        } catch (error: any) {
            return res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
        }
    }

    return res.status(400).json({ status: false, message: 'Missing required fields' });
});

salesCoverageAreaRouter.patch(apiSalesCoverageAreas + 'update/:id', upload.none(), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const employeeID = Number(req.body.employeeID);
    const provinceID = Number(req.body.provinceID);
    const cityID = Number(req.body.cityID);
    const districtID = Number(req.body.districtID);
    const villageID = Number(req.body.villageID)

    if ([employeeID, provinceID, cityID, districtID, villageID].some(isNaN)) {
        return res.status(422).json({ status: false, message: 'Unknown column NaN in field list' });
    }

    try {
        const existing = await db
            .select()
            .from(salesCoverageAreas)
            .where(
                and(
                    eq(salesCoverageAreas.employeeID, employeeID),
                    eq(salesCoverageAreas.provinceID, provinceID),
                    eq(salesCoverageAreas.cityID, cityID),
                    eq(salesCoverageAreas.districtID, districtID),
                    villageID !== null ? eq(salesCoverageAreas.villageID, villageID) : isNull(salesCoverageAreas.villageID),
                    ne(salesCoverageAreas.id, id) // pengecualian untuk record yang sedang diupdate
                )
            );

        if (existing.length > 0) {
            return res.status(409).json({
                status: false,
                message: 'This employee already has the same coverage area. Please use a different combination.',
            });
        }

        const data = { employeeID, provinceID, cityID, districtID, villageID };

        await db.update(salesCoverageAreas).set(data).where(eq(salesCoverageAreas.id, id));
        res.status(200).json({
            status: true,
            message: 'Successfully updated sales coverage area',
            data,
        });
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
    }
});


salesCoverageAreaRouter.delete(apiSalesCoverageAreas + 'delete/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        await db.delete(salesCoverageAreas).where(eq(salesCoverageAreas.id, id))
        res.status(200).json({ status: true, message: 'Successfully deleted sales coverage area' })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
    }
})

export default salesCoverageAreaRouter