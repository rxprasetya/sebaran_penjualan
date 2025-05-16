import express, { Request, Response } from "express";
import ViteExpress from "vite-express";
import db from "./config/db"
import { eq, ne, and, like, sql, asc, isNull, or } from "drizzle-orm";
import CryptoJS from "crypto-js";
import { users, employees, products, salesCoverageAreas, provinces, cities, districts, villages, productCompetitors, productDistributionAreas, retails } from "./schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import cors from "cors"
import { alias } from "drizzle-orm/mysql-core";
import jwt from 'jsonwebtoken';

const app = express();
const SECRET_KEY = process.env.SECRET_KEY!
const apiUsers = '/api/users/'
const apiEmployees = '/api/employees/'
const apiProducts = '/api/products/'
const apiSalesCoverageAreas = '/api/salescoverageareas/'
const apiRetails = '/api/retails/'
const apiLogin = '/api/login/'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadFolder = path.join(__dirname, 'uploads');
const uploadProductsPath = path.join(uploadFolder, 'products');
const uploadCompetitorsPath = path.join(uploadFolder, 'competitors');
const uploadEmployeesPath = path.join(uploadFolder, 'employees');

if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);
if (!fs.existsSync(uploadProductsPath)) fs.mkdirSync(uploadProductsPath, { recursive: true });
if (!fs.existsSync(uploadCompetitorsPath)) fs.mkdirSync(uploadCompetitorsPath, { recursive: true });
if (!fs.existsSync(uploadEmployeesPath)) fs.mkdirSync(uploadEmployeesPath, { recursive: true });

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

const storageEmployees = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadEmployeesPath),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const uploadProductImage = multer({ storage: storageProducts });
const uploadEmployeeImage = multer({ storage: storageEmployees });
const upload = multer();

app.use(cors());
app.use(express.json())

app.use('/uploads', express.static(uploadFolder));
app.use(express.urlencoded({ extended: true }))

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

// Login
app.post(apiLogin, async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Ambil user berdasarkan username
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .then(rows => rows[0]);

    if (!user) {
      return res.status(401).json({ status: false, message: 'User not found' });
    }

    // Decrypt password dari DB
    const bytes = CryptoJS.AES.decrypt(user.password, SECRET_KEY);
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8).replace(/^"|"$/g, '');

    // console.log('Encrypted in DB:', user.password);
    // console.log('Decrypted from DB:', decryptedPassword);
    // console.log('Password from user:', password);

    if (decryptedPassword !== password) {
      return res.status(401).json({ status: false, message: 'Invalid password' });
    }

    // Buat token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ status: true, message: 'Login successful', token });
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
  }
});

// Users
app.get(apiUsers, async (req: Request, res: Response) => {
  try {
    const data = await db.select({ name: users.name, username: users.username }).from(users)
    res.status(200).json({ status: true, message: 'List Users Data', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})

app.get(apiUsers + 'search/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  try {
    const data = await db.select({ name: users.name, username: users.username }).from(users).where(eq(users.id, id))
    if (data.length === 0) res.status(404).json({ status: false, message: 'Data Not Found!' })
    res.status(200).json({ status: true, message: 'Found it', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})

app.post(apiUsers + 'create', async (req: Request, res: Response) => {
  const data = {
    name: req.body.name,
    username: req.body.username,
    password: CryptoJs.AES.encrypt(JSON.stringify(req.body.password), SECRET_KEY).toString(),
  }
  if (!data.name || !data.username || !data.password) res.status(422).json({ status: false, message: 'Missing required fields' });
  try {
    await db.insert(users).values(data)
    res.status(200).json({ status: true, message: 'Successfully added user', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})

app.patch(apiUsers + 'update/:id', async (req: Request, res: Response) => {

  const id = parseInt(req.params.id)
  const data = {
    name: req.body.name,
    username: req.body.username,
    password: CryptoJs.AES.encrypt(JSON.stringify(req.body.password), SECRET_KEY).toString(),
  }
  if (!data.name || !data.username || !data.password) res.status(422).json({ status: false, message: 'Missing required fields' });
  try {
    await db.update(users).set(data).where(eq(users.id, id))
    res.status(200).json({ status: true, message: 'Sucessfully updated user', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
  }
})

app.delete(apiUsers + 'delete/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  try {
    await db.delete(users).where(eq(users.id, id))
    res.status(200).json({ status: true, message: 'Successfully deleted user' })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
  }
})

// Employee
app.get(apiEmployees, async (req: Request, res: Response) => {
  try {
    const data = await db.select().from(employees)
    res.status(200).json({ status: true, message: 'List Employees Data', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})

app.get(apiEmployees + 'search/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  try {
    const data = await db.select().from(employees).where(eq(employees.id, id))
    if (data.length === 0) res.status(404).json({ status: false, message: 'Data Not Found!' })
    res.status(200).json({ status: true, message: 'Found it', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})

app.get(apiEmployees + 'leader', async (req: Request, res: Response) => {
  try {
    const data = await db.select().from(employees).where(ne(employees.employeePosition, 'Sales'))
    res.status(200).json({ status: true, message: 'List Leaders Data', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})

app.post(apiEmployees + "create", uploadEmployeeImage.single("employeeImage"), async (req: Request, res: Response) => {
  const fileUrl = req.file ? `/uploads/employees/${req.file.filename}` : null;
  const employeeColor = req.body.employeeColor || null;
  const employeeParentID = req.body.employeeParentID ? parseInt(req.body.employeeParentID, 10) : null;
  const { employeeCode, employeeName, employeePosition } = req.body;

  if (!employeeCode || !employeeName || !employeePosition) {
    return res.status(422).json({ status: false, message: "Missing required fields" });
  }

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



app.patch(apiEmployees + 'update/:id', uploadEmployeeImage.single('employeeImage'), async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const fileUrl = req.file ? `/uploads/employees/${req.file.filename}` : null;
  const employeeColor = req.body.employeeColor || null;
  const employeeParentID = req.body.employeeParentID ? parseInt(req.body.employeeParentID, 10) : null;
  const { employeeCode, employeeName, employeePosition } = req.body;

  if (!employeeCode || !employeeName || !employeePosition) return res.status(422).json({ status: false, message: "Missing required fields" });

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
        const oldFilePath = path.join(__dirname, '..', 'server/uploads/employees', path.basename(oldEmployee.employeeImage));
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

app.delete(apiEmployees + 'delete/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));

    if (employee?.employeeImage) {
      const filePath = path.join(__dirname, '..', 'server/uploads/employees', path.basename(employee.employeeImage));
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

// Products
app.get(apiProducts, async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        id: products.id,
        productCode: products.productCode,
        productName: products.productName,
        productImage: products.productImage,
        competitorName: productCompetitors.competitorName,
        competitorImage: productCompetitors.competitorImage,
        provinceName: provinces.provinceName,
        cityName: cities.cityName,
        districtName: districts.districtName,
        villageName: villages.villageName,
      })
      .from(products)
      .innerJoin(productCompetitors, eq(products.id, productCompetitors.id))
      .innerJoin(productDistributionAreas, eq(products.id, productDistributionAreas.productID))
      .innerJoin(provinces, eq(productDistributionAreas.provinceID, provinces.id))
      .innerJoin(cities, eq(productDistributionAreas.cityID, cities.id))
      .innerJoin(districts, eq(productDistributionAreas.districtID, districts.id))
      .leftJoin(villages, eq(productDistributionAreas.villageID, villages.id))

    res.status(200).json({ status: true, message: 'List Products Data', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})

app.get(apiProducts + 'search/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  try {
    const data = await db
      .select({
        id: products.id,
        productCode: products.productCode,
        productName: products.productName,
        productImage: products.productImage,
        competitorName: productCompetitors.competitorName,
        competitorImage: productCompetitors.competitorImage,
        provinceID: provinces.id,
        provinceName: provinces.provinceName,
        cityID: cities.id,
        cityName: cities.cityName,
        districtID: districts.id,
        districtName: districts.districtName,
        villageID: villages.id,
        villageName: villages.villageName,
      })
      .from(products)
      .innerJoin(productCompetitors, eq(products.id, productCompetitors.id))
      .innerJoin(productDistributionAreas, eq(products.id, productDistributionAreas.productID))
      .innerJoin(provinces, eq(productDistributionAreas.provinceID, provinces.id))
      .innerJoin(cities, eq(productDistributionAreas.cityID, cities.id))
      .innerJoin(districts, eq(productDistributionAreas.districtID, districts.id))
      .leftJoin(villages, eq(productDistributionAreas.villageID, villages.id))
      .where(eq(products.id, id))

    if (data.length === 0) res.status(404).json({ status: false, message: 'Data Not Found!' })
    res.status(200).json({ status: true, message: 'Found it', data })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})

app.post(apiProducts + "create", uploadProductImage.fields([
  { name: "productImage", maxCount: 1 },
  { name: "competitorImage", maxCount: 1 }
]), async (req: Request, res: Response) => {

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const productImageFile = files["productImage"]?.[0];
  const competitorImageFile = files["competitorImage"]?.[0];
  const provinceID = Number(req.body.provinceID);
  const cityID = Number(req.body.cityID);
  const districtID = Number(req.body.districtID);
  const villageID = req.body.villageID ? Number(req.body.villageID) : null;

  const fileUrlProduct = productImageFile ? `/uploads/products/${productImageFile.filename}` : null;
  const fileUrlCompetitor = competitorImageFile ? `/uploads/competitors/${competitorImageFile.filename}` : null;

  const { productCode, productName } = req.body;
  const { competitorName } = req.body;

  if (!productCode || !productName || !competitorName || !provinceID || !cityID || !districtID) {
    return res.status(422).json({ status: false, message: "Missing required fields" });
  }

  const productData = { productCode, productName, productImage: fileUrlProduct };

  try {
    // Cek apakah data dengan kode atau kode produk dan nama produk sudah ada
    // const existing = await db
    //   .select()
    //   .from(products)
    //   .where(
    //     or(
    //       eq(products.productCode, productCode),
    //       and(
    //         eq(products.productCode, productCode),
    //         eq(products.productName, productName)
    //       ),
    //     )
    //   )


    // if (existing.length > 0) {
    //   return res.status(409).json({
    //     status: false,
    //     message: "Product with the same code or (code, name) already exists. Please use different values.",
    //   });
    // }

    const insertedProduct = await db.insert(products).values(productData).$returningId();

    const productId = insertedProduct[0]?.id;

    const competitorData = {
      competitorName,
      competitorImage: fileUrlCompetitor,
      productID: productId,
    };

    const productDistributionAreaData = {
      productID: productId,
      provinceID,
      cityID,
      districtID,
      villageID,
    }

    await db.insert(productCompetitors).values(competitorData);
    await db.insert(productDistributionAreas).values(productDistributionAreaData);

    res.status(200).json({ status: true, message: "Successfully added product", data: [productData, competitorData] });
  } catch (error: any) {
    res.status(500).json({ status: false, message: "Internal Server Error: " + error.message });
  }
});


app.patch(apiProducts + 'update/:id', uploadProductImage.fields([
  { name: "productImage", maxCount: 1, },
  { name: "competitorImage", maxCount: 1 }
]), async (req: Request, res: Response) => {


  const id = parseInt(req.params.id);

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const productImageFile = files["productImage"]?.[0];
  const competitorImageFile = files["competitorImage"]?.[0];
  const provinceID = Number(req.body.provinceID);
  const cityID = Number(req.body.cityID);
  const districtID = Number(req.body.districtID);
  const villageID = req.body.villageID ? Number(req.body.villageID) : null;

  const fileUrlProduct = productImageFile ? `/uploads/products/${productImageFile.filename}` : null;
  const fileUrlCompetitor = competitorImageFile ? `/uploads/competitors/${competitorImageFile.filename}` : null;

  const { productCode, productName, competitorName } = req.body;

  if (!productCode || !productName || !competitorName || !provinceID || !cityID || !districtID) {
    return res.status(422).json({ status: false, message: "Missing required fields" });
  }

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
    const [oldcCompetitor] = await db.select().from(productCompetitors).where(eq(productCompetitors.productID, id));

    const productUpdateData: any = {
      productCode,
      productName,
    };

    const competitorUpdateData: any = {
      competitorName,
    };

    const productDistributionAreaData = {
      provinceID,
      cityID,
      districtID,
      villageID,
    }

    if (fileUrlProduct) {
      if (oldProduct?.productImage) {
        const oldFilePath = path.join(__dirname, '..', 'server/uploads/products', path.basename(oldProduct.productImage));
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      productUpdateData.productImage = fileUrlProduct;
    }

    if (fileUrlCompetitor) {
      if (oldcCompetitor?.competitorImage) {
        const oldFilePath = path.join(__dirname, '..', 'server/uploads/competitors', path.basename(oldcCompetitor.competitorImage));
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      competitorUpdateData.competitorImage = fileUrlCompetitor;
    }

    await db.update(products).set(productUpdateData).where(eq(products.id, id));
    await db.update(productCompetitors).set(competitorUpdateData).where(eq(productCompetitors.productID, id));
    await db.update(productDistributionAreas).set(productDistributionAreaData).where(eq(productDistributionAreas.productID, id));

    res.status(200).json({ status: true, message: 'Successfully updated product', data: [productUpdateData, competitorUpdateData] });
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal server error: ' + error.message });
  }
});

app.delete(apiProducts + 'delete/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    const [competitor] = await db.select().from(productCompetitors).where(eq(productCompetitors.productID, id));

    if (product?.productImage) {
      const filePath = path.join(__dirname, '..', 'server/uploads/products', path.basename(product.productImage));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (competitor?.competitorImage) {
      const filePath = path.join(__dirname, '..', 'server/uploads/competitors', path.basename(competitor.competitorImage));
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

app.get('/api/provinces', async (req: Request, res: Response) => {

  const search = req.query.search as string | undefined;

  try {
    const whereClause = search ? like(sql`LOWER(${provinces.provinceName})`, `%${search.toLowerCase()}%`) : undefined;
    const data = await db
      .select({
        id: provinces.id,
        provinceName: provinces.provinceName,
      })
      .from(provinces)
      .where(whereClause)
      .limit(5)
      .offset(0)
      .orderBy(asc(provinces.provinceName))

    res.status(200).json({ status: true, message: 'List Provinces Data', data });
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message });
  }
});

app.get('/api/cities', async (req: Request, res: Response) => {

  const search = req.query.search as string | undefined;
  const provinceID = req.query.provinceID ? Number(req.query.provinceID) : undefined;
  // console.log('provinceID:', provinceID, 'typeof:', typeof provinceID);
  try {
    const conditions = [];

    if (provinceID) {
      conditions.push(eq(cities.provinceID, provinceID));
    }

    if (search) {
      conditions.push(like(sql`LOWER(${cities.cityName})`, `%${search.toLowerCase()}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: cities.id,
        cityName: cities.cityName,
        provinceID: cities.provinceID,
      })
      .from(cities)
      .where(whereClause)
      .limit(5)
      .offset(0)
      .orderBy(asc(cities.cityName))

    res.status(200).json({ status: true, message: 'List Cities Data', data });
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message });
  }
});

app.get('/api/districts', async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const provinceID = req.query.provinceID ? Number(req.query.provinceID) : undefined;
  const cityID = req.query.cityID ? Number(req.query.cityID) : undefined;

  try {
    const conditions = [];

    if (provinceID) {
      conditions.push(eq(districts.provinceID, provinceID));
    }

    if (cityID) {
      conditions.push(eq(districts.cityID, cityID));
    }

    if (search) {
      conditions.push(like(sql`LOWER(${districts.districtName})`, `%${search.toLowerCase()}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: districts.id,
        districtName: districts.districtName,
        provinceID: districts.provinceID,
        cityID: districts.cityID,
      })
      .from(districts)
      .where(whereClause)
      .limit(5)
      .offset(0)
      .orderBy(asc(districts.districtName))

    res.status(200).json({ status: true, message: 'List Districts Data', data });
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message });
  }
});

app.get('/api/villages', async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const provinceID = req.query.provinceID ? Number(req.query.provinceID) : undefined;
  const cityID = req.query.cityID ? Number(req.query.cityID) : undefined;
  const districtID = req.query.districtID ? Number(req.query.districtID) : undefined;

  try {
    const conditions = [];

    if (provinceID) {
      conditions.push(eq(villages.provinceID, provinceID));
    }

    if (cityID) {
      conditions.push(eq(villages.cityID, cityID));
    }

    if (districtID) {
      conditions.push(eq(villages.districtID, districtID));
    }

    if (search) {
      conditions.push(like(sql`LOWER(${villages.villageName})`, `%${search.toLowerCase()}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select({
        id: villages.id,
        villageName: villages.villageName,
        provinceID: villages.provinceID,
        cityID: villages.cityID,
        districtID: villages.districtID,
      })
      .from(villages)
      .where(whereClause)
      .limit(5)
      .offset(0)
      .orderBy(asc(villages.villageName))

    // Convert BigInt fields to strings
    const dataWithStrings = data.map((item: any) => ({
      ...item,
      id: item.id.toString(),  // Convert BigInt to string
      provinceID: item.provinceID.toString(),
      cityID: item.cityID.toString(),
      districtID: item.districtID.toString(),
    }));

    // Send the response with the converted data
    res.status(200).json({ status: true, message: 'List Villages Data', data: dataWithStrings });
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message });
  }
});

// SalesCoverageAreas
app.get(apiSalesCoverageAreas, async (req: Request, res: Response) => {
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

app.get(apiSalesCoverageAreas + 'sales', async (req: Request, res: Response) => {
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

app.get(apiSalesCoverageAreas + 'search/:id', async (req: Request, res: Response) => {
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


app.post(apiSalesCoverageAreas + 'create', upload.none(), async (req: Request, res: Response) => {
  const employeeID = Number(req.body.employeeID);
  const provinceID = Number(req.body.provinceID);
  const cityID = Number(req.body.cityID);
  const districtID = Number(req.body.districtID);
  const villageID = req.body.villageID ? Number(req.body.villageID) : null;

  if ([employeeID, provinceID, cityID, districtID].some(isNaN)) {
    return res.status(422).json({ status: false, message: 'Unknown column NaN in field list' });
  }

  if (employeeID && provinceID && cityID && districtID) {
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
        data: { ...data, villageID: villageID?.toString() ?? null },
      });
    } catch (error: any) {
      return res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
    }
  }

  return res.status(400).json({ status: false, message: 'Missing required fields' });
});

app.patch(apiSalesCoverageAreas + 'update/:id', upload.none(), async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const employeeID = Number(req.body.employeeID);
  const provinceID = Number(req.body.provinceID);
  const cityID = Number(req.body.cityID);
  const districtID = Number(req.body.districtID);
  const villageID = req.body.villageID ? Number(req.body.villageID) : null;

  if ([employeeID, provinceID, cityID, districtID].some(isNaN)) {
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
      data: { ...data, villageID: villageID?.toString() ?? null },
    });
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
  }
});


app.delete(apiSalesCoverageAreas + 'delete/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  try {
    await db.delete(salesCoverageAreas).where(eq(salesCoverageAreas.id, id))
    res.status(200).json({ status: true, message: 'Successfully deleted sales coverage area' })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
  }
})


// Retails
app.get(apiRetails, async (req: Request, res: Response) => {
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

app.get(apiRetails + 'search/:id', async (req: Request, res: Response) => {
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

app.post(apiRetails + 'create', upload.none(), async (req: Request, res: Response) => {

  const { retailName, address } = req.body
  const provinceID = Number(req.body.provinceID)
  const cityID = Number(req.body.cityID)
  const districtID = Number(req.body.districtID)
  const villageID = req.body.villageID ? Number(req.body.villageID) : null

  if ([provinceID, cityID, districtID].some(isNaN) || !retailName) {
    return res.status(422).json({ status: false, message: 'Missing required fields' });
  }

  if (retailName && provinceID && cityID && districtID) {
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
            villageID !== null
              ? eq(retails.villageID, villageID)
              : isNull(retails.villageID)
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
        data: { ...data, villageID: villageID?.toString() ?? null },
      });
    } catch (error: any) {
      return res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
    }
  }
})

app.patch(apiRetails + 'update/:id', upload.none(), async (req: Request, res: Response) => {

  const id = Number(req.params.id)
  const { retailName, address } = req.body
  const provinceID = Number(req.body.provinceID)
  const cityID = Number(req.body.cityID)
  const districtID = Number(req.body.districtID)
  const villageID = req.body.villageID ? Number(req.body.villageID) : null

  if ([provinceID, cityID, districtID].some(isNaN) || !retailName) {
    return res.status(422).json({ status: false, message: 'Missing required fields' });
  }

  if (retailName && provinceID && cityID && districtID) {
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
            villageID !== null ? eq(retails.villageID, villageID) : isNull(retails.villageID),
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
        data: { ...data, villageID: villageID?.toString() ?? null },
      });
    } catch (error: any) {
      return res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
    }
  }
})

app.delete(apiRetails + 'delete/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  try {
    await db.delete(retails).where(eq(retails.id, id))
    res.status(200).json({ status: true, message: 'Successfully deleted retail' })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
  }
})

app.get('/api/map', async (req: Request, res: Response) => {
  try {
    const parentEmployee = alias(employees, "parentEmployee");

    const data = await db
      .select({
        scaID: salesCoverageAreas.id,
        employeeName: employees.employeeName,
        employeeImage: employees.employeeImage,
        employeeColor: employees.employeeColor,
        employeeParent: parentEmployee.employeeName, // ini ambil dari parent
        provinceName: provinces.provinceName,
        cityName: cities.cityName,
        districtID: salesCoverageAreas.districtID,
        districtCode: districts.districtCode,
        districtName: districts.districtName,
        villageName: villages.villageName,
        productName: products.productName,
        competitorName: productCompetitors.competitorName,
        retailName: retails.retailName,
        retailAddress: retails.address,
      })
      .from(salesCoverageAreas)
      .innerJoin(employees, eq(salesCoverageAreas.employeeID, employees.id))
      .leftJoin(parentEmployee, eq(employees.employeeParentID, parentEmployee.id)) // self join
      .innerJoin(provinces, eq(salesCoverageAreas.provinceID, provinces.id))
      .innerJoin(cities, eq(salesCoverageAreas.cityID, cities.id))
      .innerJoin(districts, eq(salesCoverageAreas.districtID, districts.id))
      .leftJoin(villages, eq(salesCoverageAreas.villageID, villages.id))
      .innerJoin(productDistributionAreas, eq(villages.id, productDistributionAreas.villageID))
      .innerJoin(products, eq(productDistributionAreas.productID, products.id))
      .innerJoin(productCompetitors, eq(products.id, productCompetitors.productID))
      .innerJoin(retails, eq(villages.id, retails.villageID))

    const grouped = Object.values(data.reduce((acc: any, item) => {
      const key = item.villageName || `district-${item.districtID}`; // fallback jika village null

      if (!acc[key]) {
        acc[key] = {
          villageName: item.villageName,
          districtName: item.districtName,
          cityName: item.cityName,
          provinceName: item.provinceName,
          employeeName: item.employeeName,
          employeeImage: item.employeeImage,
          employeeColor: item.employeeColor,
          employeeParent: item.employeeParent,
          districtID: item.districtID,
          districtCode: item.districtCode,
          details: []
        };
      }

      acc[key].details.push({
        productName: item.productName,
        competitorName: item.competitorName,
        retailName: item.retailName,
        retailAddress: item.retailAddress
      });

      return acc;
    }, {}));

    res.status(200).json({ status: true, message: 'List Sales Coverage Areas Data', data: grouped })
  } catch (error: any) {
    res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
  }
})


ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
