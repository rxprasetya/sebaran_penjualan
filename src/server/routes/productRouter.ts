import express, { Request, Response } from "express";
import db from "../config/db"
import { cities, districts, productCompetitors, productDistributionAreas, products, provinces, villages } from "../schema";
import { and, eq, ne, or } from "drizzle-orm";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import multer from "multer";
import { body, validationResult } from 'express-validator'

const productRouter = express.Router();
const apiProducts = '/api/products/'
const apiProductDistributionAreas = '/productdistributionareas/'
const apiProductCompetitors = '/competitors/'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, '../uploads');

const uploadProductsPath = path.join(uploadFolder, 'products');
const uploadCompetitorsPath = path.join(uploadFolder, 'competitors');

if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);
if (!fs.existsSync(uploadProductsPath)) fs.mkdirSync(uploadProductsPath, { recursive: true });
if (!fs.existsSync(uploadCompetitorsPath)) fs.mkdirSync(uploadCompetitorsPath, { recursive: true });

const storageProducts = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "productImage") {
            cb(null, uploadProductsPath);
        } else if (file.fieldname === "competitorImage") {
            cb(null, uploadCompetitorsPath);
        } else {
            cb(new Error("Invalid fieldname"), "");
        }
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});

const uploadProductImage = multer({ storage: storageProducts });
const upload = multer();

// Products
productRouter.get(apiProducts, async (req: Request, res: Response) => {
    try {
        const data = await db
            .select()
            .from(products)

        res.status(200).json({ status: true, message: 'List Products Data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

productRouter.get(apiProducts + 'search/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const data = await db
            .select()
            .from(products)
            .where(eq(products.id, id))

        if (data.length === 0) res.status(404).json({ status: false, message: 'Data Not Found!' })

        res.status(200).json({ status: true, message: 'Found it', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

productRouter.post(apiProducts + "create",
    uploadProductImage.fields([{ name: "productImage", maxCount: 1 }]), [
    body('productCode')
        .isLength({ max: 8 })
        .withMessage('Code has max length is 8')
        .notEmpty().withMessage('Code is required'),
    body('productName').notEmpty().withMessage('Name is required')
], async (req: Request, res: Response) => {

    const error = validationResult(req)

    if (!error.isEmpty()) {
        return res.status(422).json({ status: false, errors: error.array() });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const productImageFile = files["productImage"]?.[0];
    const fileUrlProduct = productImageFile ? `/uploads/products/${productImageFile.filename}` : null;

    const { productCode, productName } = req.body;

    const productData = { productCode, productName, productImage: fileUrlProduct };

    try {
        // Cek apakah data dengan kode atau kode produk dan nama produk sudah ada
        const existing = await db
            .select()
            .from(products)
            .where(
                or(
                    eq(products.productCode, productCode),
                    and(
                        eq(products.productCode, productCode),
                        eq(products.productName, productName)
                    ),
                )
            )

        if (existing.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Product with the same code or (code, name) already exists. Please use different values.",
            });
        }

        const data = await db.insert(products).values(productData);

        res.status(200).json({ status: true, message: "Successfully added product", data });
    } catch (error: any) {
        res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
    }
});


productRouter.patch(apiProducts + 'update/:id',
    uploadProductImage.fields([{ name: "productImage", maxCount: 1 }]), [
    body('productCode')
        .isLength({ max: 8 })
        .withMessage('Code has max length is 8')
        .notEmpty().withMessage('Code is required'),
    body('productName').notEmpty().withMessage('Name is required')
], async (req: Request, res: Response) => {

    const error = validationResult(req)

    if (!error.isEmpty()) {
        return res.status(422).json({ status: false, errors: error.array() });
    }
    const id = parseInt(req.params.id);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const productImageFile = files["productImage"]?.[0];
    const fileUrlProduct = productImageFile ? `/uploads/products/${productImageFile.filename}` : null;

    const { productCode, productName } = req.body;

    try {
        // Check for duplicate productCode or productName (excluding current product)
        const duplicates = await db
            .select()
            .from(products)
            .where(
                and(
                    or(
                        eq(products.productCode, productCode),
                        and(
                            eq(products.productCode, productCode),
                            eq(products.productName, productName)
                        )
                    ),
                    ne(products.id, id)
                )
            );

        if (duplicates.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Product with the same code or name already exists. Please use different values.",
            });
        }
        const [oldProduct] = await db.select().from(products).where(eq(products.id, id));

        const productUpdateData: any = {
            productCode,
            productName,
        };

        if (fileUrlProduct) {
            if (oldProduct?.productImage) {
                const oldFilePath = path.join(__dirname, '../..', 'server/uploads/products', path.basename(oldProduct.productImage));
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            }
            productUpdateData.productImage = fileUrlProduct;
        }

        await db.update(products).set(productUpdateData).where(eq(products.id, id));

        res.status(200).json({ status: true, message: 'Successfully updated product', data: productUpdateData });
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error: ' + error.message });
    }
});

productRouter.delete(apiProducts + 'delete/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        const [product] = await db.select().from(products).where(eq(products.id, id));
        const [competitor] = await db.select().from(productCompetitors).where(eq(productCompetitors.productID, id));

        if (product?.productImage) {
            const filePath = path.join(__dirname, '../..', 'server/uploads/products', path.basename(product.productImage));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        if (competitor?.competitorImage) {
            const filePath = path.join(__dirname, '../..', 'server/uploads/competitors', path.basename(competitor.competitorImage));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.delete(productDistributionAreas).where(eq(productDistributionAreas.productID, id));
        await db.delete(productCompetitors).where(eq(productCompetitors.productID, id));
        await db.delete(products).where(eq(products.id, id));
        res.status(200).json({ status: true, message: 'Successfully deleted product' });
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error: ' + error.message });
    }
});

productRouter.get(apiProducts + ':productID' + apiProductDistributionAreas, async (req: Request, res: Response) => {
    const productID = parseInt(req.params.productID);
    try {
        const data = await db
            .select({
                pdaID: productDistributionAreas.id,
                productCode: products.productCode,
                productName: products.productName,
                provinceName: provinces.provinceName,
                cityName: cities.cityName,
                districtName: districts.districtName,
                villageName: villages.villageName,
            })
            .from(productDistributionAreas)
            .innerJoin(products, eq(productDistributionAreas.productID, products.id))
            .innerJoin(provinces, eq(productDistributionAreas.provinceID, provinces.id))
            .innerJoin(cities, eq(productDistributionAreas.cityID, cities.id))
            .innerJoin(districts, eq(productDistributionAreas.districtID, districts.id))
            .innerJoin(villages, eq(productDistributionAreas.villageID, villages.id))
            .where(eq(productDistributionAreas.productID, productID))

        res.status(200).json({ status: true, message: 'List Product Distribution Areas Data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

productRouter.get(apiProducts + ':productID' + apiProductDistributionAreas + 'search/:id', async (req: Request, res: Response) => {
    const productID = parseInt(req.params.productID)
    const id = parseInt(req.params.id)
    try {
        const data = await db
            .select({
                provinceID: provinces.id,
                provinceName: provinces.provinceName,
                cityID: cities.id,
                cityName: cities.cityName,
                districtID: districts.id,
                districtName: districts.districtName,
                villageID: villages.id,
                villageName: villages.villageName,
            })
            .from(productDistributionAreas)
            .innerJoin(products, eq(productDistributionAreas.productID, products.id))
            .innerJoin(provinces, eq(productDistributionAreas.provinceID, provinces.id))
            .innerJoin(cities, eq(productDistributionAreas.cityID, cities.id))
            .innerJoin(districts, eq(productDistributionAreas.districtID, districts.id))
            .innerJoin(villages, eq(productDistributionAreas.villageID, villages.id))
            .where(
                and(
                    eq(productDistributionAreas.productID, productID),
                    eq(productDistributionAreas.id, id)
                )
            )

        if (data.length === 0) res.status(404).json({ status: false, message: 'Data Not Found!' })

        res.status(200).json({ status: true, message: 'Found it', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

productRouter.post(apiProducts + ':productID' + apiProductDistributionAreas + 'create', upload.none(), async (req: Request, res: Response) => {
    const productID = parseInt(req.params.productID)
    const provinceID = Number(req.body.provinceID);
    const cityID = Number(req.body.cityID);
    const districtID = Number(req.body.districtID);
    const villageID = Number(req.body.villageID);

    if (!provinceID || !cityID || !districtID || !villageID) {
        return res.status(422).json({ status: false, message: "Missing required fields" });
    }

    try {
        // Cek apakah data dengan area distribusi produk sudah ada
        const existing = await db
            .select()
            .from(productDistributionAreas)
            .where(
                and(
                    eq(productDistributionAreas.productID, productID),
                    eq(productDistributionAreas.villageID, villageID),
                )
            )

        if (existing.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Product with the same area already exists. Please use different values.",
            });
        }

        const formData = {
            productID,
            provinceID,
            cityID,
            districtID,
            villageID,
        }

        const data = await db.insert(productDistributionAreas).values(formData);

        res.status(200).json({ status: true, message: "Successfully added distribution area", data });
    } catch (error: any) {
        res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
    }

})

productRouter.patch(apiProducts + ':productID' + apiProductDistributionAreas + 'update/:id', upload.none(), async (req: Request, res: Response) => {
    const productID = parseInt(req.params.productID)
    const id = parseInt(req.params.id)
    const provinceID = Number(req.body.provinceID);
    const cityID = Number(req.body.cityID);
    const districtID = Number(req.body.districtID);
    const villageID = Number(req.body.villageID);

    if (!provinceID || !cityID || !districtID || !villageID) {
        return res.status(422).json({ status: false, message: "Missing required fields" });
    }

    try {
        // Cek apakah data dengan area distribusi produk sudah ada
        const existing = await db
            .select()
            .from(productDistributionAreas)
            .where(
                and(
                    eq(productDistributionAreas.villageID, villageID),
                    eq(productDistributionAreas.productID, productID),
                    ne(productDistributionAreas.id, id)
                ),
            )

        if (existing.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Product with the same area already exists. Please use different values.",
            });
        }

        const formData = {
            productID,
            provinceID,
            cityID,
            districtID,
            villageID,
        }

        const data = await db.update(productDistributionAreas).set(formData).where(eq(productDistributionAreas.id, id));

        res.status(200).json({ status: true, message: "Successfully updated distribution area", data });
    } catch (error: any) {
        res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
    }

})

productRouter.delete(apiProducts + ':productID' + apiProductDistributionAreas + 'delete/:id', async (req: Request, res: Response) => {
    const productID = Number(req.params.productID)
    const id = Number(req.params.id)
    try {
        await db
            .delete(productDistributionAreas)
            .where(
                and(
                    eq(productDistributionAreas.id, id),
                    eq(productDistributionAreas.productID, productID),
                )
            )
        res.status(200).json({ status: true, message: "Successfully deleted distribution area" });
    } catch (error: any) {
        res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
    }
})


// Product Competitors
productRouter.get(apiProducts + ':productID' + apiProductCompetitors, async (req: Request, res: Response) => {
    const productID = parseInt(req.params.productID);
    try {
        const data = await db
            .select({
                pcID: productCompetitors.id,
                productCode: products.productCode,
                productName: products.productName,
                competitorName: productCompetitors.competitorName,
            })
            .from(productCompetitors)
            .innerJoin(products, eq(productCompetitors.productID, products.id))
            .where(eq(productCompetitors.productID, productID))

        res.status(200).json({ status: true, message: 'List Product Competitors Data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

productRouter.get(apiProducts + ':productID' + apiProductCompetitors + 'search/:id', async (req: Request, res: Response) => {
    const productID = parseInt(req.params.productID)
    const id = parseInt(req.params.id)

    try {
        const data = await db
            .select({
                productCode: products.productCode,
                productName: products.productName,
                competitorName: productCompetitors.competitorName,
            })
            .from(productCompetitors)
            .innerJoin(products, eq(productCompetitors.productID, products.id))
            .where(
                and(
                    eq(productCompetitors.productID, productID),
                    eq(productCompetitors.id, id)
                )
            )

        if (data.length === 0) res.status(404).json({ status: false, message: 'Data Not Found!' })

        res.status(200).json({ status: true, message: 'Found it', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

productRouter.post(apiProducts + ':productID' + apiProductCompetitors + 'create', uploadProductImage.fields([{ name: 'competitorImage', maxCount: 1 }]), async (req: Request, res: Response) => {
    const productID = parseInt(req.params.productID)

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const competitorImageFile = files["competitorImage"]?.[0];
    const fileUrlCompetitor = competitorImageFile ? `/uploads/competitors/${competitorImageFile.filename}` : null;
    const competitorName = req.body.competitorName

    if (!competitorName) {
        return res.status(422).json({ status: false, message: "Missing required fields" });
    }

    try {
        // Cek apakah data dengan area distribusi produk sudah ada
        const existing = await db
            .select()
            .from(productCompetitors)
            .where(
                and(
                    eq(productCompetitors.productID, productID),
                    eq(productCompetitors.competitorName, competitorName),
                )
            )

        if (existing.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Product with the same competitor already exists. Please use different values.",
            });
        }

        const formData = {
            productID,
            competitorName,
            fileUrlCompetitor
        }

        const data = await db.insert(productCompetitors).values(formData);

        res.status(200).json({ status: true, message: "Successfully added competitor", data });
    } catch (error: any) {
        res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
    }

})

productRouter.patch(apiProducts + ':productID' + apiProductCompetitors + 'update/:id',
    uploadProductImage.fields([
        {
            name: 'competitorImage', maxCount: 1
        }
    ]), async (req: Request, res: Response) => {
        const productID = parseInt(req.params.productID)
        const id = parseInt(req.params.id)

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const competitorImageFile = files["competitorImage"]?.[0];
        const fileUrlCompetitor = competitorImageFile ? `/uploads/competitors/${competitorImageFile.filename}` : null;
        const competitorName = req.body.competitorName

        if (!competitorName) {
            return res.status(422).json({ status: false, message: "Missing required fields" });
        }

        try {
            // Cek apakah data dengan area distribusi produk sudah ada
            const existing = await db
                .select()
                .from(productCompetitors)
                .where(
                    and(
                        eq(productCompetitors.productID, productID),
                        eq(productCompetitors.competitorName, competitorName),
                        ne(productCompetitors.id, id)
                    ),
                )

            if (existing.length > 0) {
                return res.status(409).json({
                    status: false,
                    message: "Product with the same competitor already exists. Please use different values.",
                });
            }

            const [oldcCompetitor] = await db.select().from(productCompetitors).where(eq(productCompetitors.productID, id));

            const formData: any = {
                productID,
                competitorName,
            }

            if (fileUrlCompetitor) {
                if (oldcCompetitor?.competitorImage) {
                    const oldFilePath = path.join(__dirname, '../..', 'server/uploads/competitors', path.basename(oldcCompetitor.competitorImage));
                    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
                }
                formData.competitorImage = fileUrlCompetitor;
            }

            const data = await db.update(productCompetitors).set(formData).where(eq(productCompetitors.id, id));

            res.status(200).json({ status: true, message: "Successfully updated competitor", data });
        } catch (error: any) {
            res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
        }

    })

productRouter.delete(apiProducts + ':productID' + apiProductCompetitors + 'delete/:id', async (req: Request, res: Response) => {
    const productID = Number(req.params.productID)
    const id = Number(req.params.id)
    try {
        await db
            .delete(productCompetitors)
            .where(
                and(
                    eq(productCompetitors.id, id),
                    eq(productCompetitors.productID, productID),
                )
            )
        res.status(200).json({ status: true, message: "Successfully deleted competitor" });
    } catch (error: any) {
        res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
    }
})

productRouter.use('/uploads', express.static(uploadFolder));

export default productRouter