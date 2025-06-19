import express, { Request, Response } from "express";
import db from "../config/db"
import { cities, districts, provinces, retails, villages } from "../schema";
import { and, eq, ne } from "drizzle-orm";
import multer from "multer";

const retailRouter = express.Router();
const apiRetails = '/api/retails/'
const upload = multer();


// Retails
retailRouter.get(apiRetails, async (req: Request, res: Response) => {
    try {
        const data = await db
            .select({
                id: retails.id,
                retailName: retails.retailName,
                provinceID: provinces.id,
                provinceName: provinces.provinceName,
                cityID: cities.id,
                cityName: cities.cityName,
                districtID: districts.id,
                districtName: districts.districtName,
                villageID: villages.id,
                villageName: villages.villageName,
                address: retails.address
            })
            .from(retails)
            .innerJoin(provinces, eq(retails.provinceID, provinces.id))
            .innerJoin(cities, eq(retails.cityID, cities.id))
            .innerJoin(districts, eq(retails.districtID, districts.id))
            .innerJoin(villages, eq(retails.villageID, villages.id))
        res.status(200).json({ status: true, message: 'List retails data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
    }
})

retailRouter.get(apiRetails + 'search/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
        const data = await db
            .select({
                retailName: retails.retailName,
                provinceID: provinces.id,
                provinceName: provinces.provinceName,
                cityID: cities.id,
                cityName: cities.cityName,
                districtID: districts.id,
                districtName: districts.districtName,
                villageID: villages.id,
                villageName: villages.villageName,
                address: retails.address
            })
            .from(retails)
            .innerJoin(provinces, eq(retails.provinceID, provinces.id))
            .innerJoin(cities, eq(retails.cityID, cities.id))
            .innerJoin(districts, eq(retails.districtID, districts.id))
            .innerJoin(villages, eq(retails.villageID, villages.id))
            .where(eq(retails.id, id))

        if (data.length === 0) {
            res.status(404).json({ status: false, message: 'Retail not found', data })
        }
        res.status(200).json({ status: true, message: 'Found it', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
    }
})

retailRouter.post(apiRetails + 'create', upload.none(), async (req: Request, res: Response) => {

    const { retailName, address } = req.body
    const provinceID = Number(req.body.provinceID)
    const cityID = Number(req.body.cityID)
    const districtID = Number(req.body.districtID)
    const villageID = Number(req.body.villageID)

    if ([provinceID, cityID, districtID, villageID].some(isNaN) || !retailName) {
        return res.status(422).json({ status: false, message: 'Missing required fields' });
    }

    if (retailName && provinceID && cityID && districtID && villageID) {
        try {
            // Check if the data already exists
            const existing = await db
                .select()
                .from(retails)
                .where(
                    and(
                        eq(retails.retailName, retailName),
                        eq(retails.provinceID, provinceID),
                        eq(retails.cityID, cityID),
                        eq(retails.districtID, districtID),
                        eq(retails.villageID, villageID),
                    )
                );

            if (existing.length > 0) {
                return res.status(409).json({
                    status: false,
                    message: 'The retail area already exists. Please provide different values.',
                });
            }

            const formData = {
                retailName,
                provinceID,
                cityID,
                districtID,
                villageID,
                address
            }
            const data = await db.insert(retails).values(formData);

            return res.status(200).json({
                status: true,
                message: 'Successfully added retail',
                data,
            });
        } catch (error: any) {
            return res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
        }
    }
})

retailRouter.patch(apiRetails + 'update/:id', upload.none(), async (req: Request, res: Response) => {

    const id = Number(req.params.id)
    const { retailName, address } = req.body
    const provinceID = Number(req.body.provinceID)
    const cityID = Number(req.body.cityID)
    const districtID = Number(req.body.districtID)
    const villageID = Number(req.body.villageID)

    if ([provinceID, cityID, districtID, villageID].some(isNaN) || !retailName) {
        return res.status(422).json({ status: false, message: 'Missing required fields' });
    }

    if (retailName && provinceID && cityID && districtID && villageID) {
        try {
            // Check if the data already exists
            const existing = await db
                .select()
                .from(retails)
                .where(
                    and(
                        eq(retails.retailName, retailName),
                        eq(retails.provinceID, provinceID),
                        eq(retails.cityID, cityID),
                        eq(retails.districtID, districtID),
                        eq(retails.villageID, villageID),
                        ne(retails.id, id),
                    )
                );

            if (existing.length > 0) {
                return res.status(409).json({
                    status: false,
                    message: 'The retail area already exists. Please provide different values.',
                });
            }

            const formData = {
                retailName,
                provinceID,
                cityID,
                districtID,
                villageID,
                address
            }
            const data = await db.update(retails).set(formData).where(eq(retails.id, id));

            return res.status(200).json({
                status: true,
                message: 'Successfully updated retail',
                data,
            });
        } catch (error: any) {
            return res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
        }
    }
})

retailRouter.delete(apiRetails + 'delete/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        await db.delete(retails).where(eq(retails.id, id))
        res.status(200).json({ status: true, message: 'Successfully deleted retail' })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
    }
})

export default retailRouter