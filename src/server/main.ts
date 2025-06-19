import express, { Request, Response } from "express";
import ViteExpress from "vite-express";
import db from "./config/db"
import { eq, ne, and, like, sql, asc, isNull, or, count, countDistinct } from "drizzle-orm";
import { employees, products, salesCoverageAreas, provinces, cities, districts, villages, productCompetitors, productDistributionAreas, retails } from "./schema";
import cors from "cors"
import { alias } from "drizzle-orm/mysql-core";
import userRouter from "./routes/userRouter";
import employeeRouter from "./routes/employeeRouter";
import retailRouter from "./routes/retailRouter";
import productRouter from "./routes/productRouter";
import salesCoverageAreaRouter from "./routes/salesCoverageAreaRouter";
import loginRouter from "./routes/loginRouter";

const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use(loginRouter)
app.use(userRouter)
app.use(employeeRouter)
app.use(retailRouter)
app.use(productRouter)
app.use(salesCoverageAreaRouter)

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

app.get('/api/total', async (req: Request, res: Response) => {
  try {
    const totalEmployees = await db.select({ count: count(employees.id) }).from(employees).where(eq(employees.employeePosition, 'Sales'))
    const totalProducts = await db.select({ count: count(products.id) }).from(products)
    const totalAreas = await db.select({ count: countDistinct(salesCoverageAreas.provinceID) }).from(salesCoverageAreas)
    const totalRetails = await db.select({ count: count(retails.id) }).from(retails)
    res.status(200).json({ status: true, message: 'Total Employees', data: { totalEmployees, totalProducts, totalAreas, totalRetails } })
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
      .leftJoin(productDistributionAreas, eq(villages.id, productDistributionAreas.villageID))
      .leftJoin(products, eq(productDistributionAreas.productID, products.id))
      .leftJoin(productCompetitors, eq(products.id, productCompetitors.productID))
      .leftJoin(retails, eq(villages.id, retails.villageID))

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
  console.log("Server is listening on port http://localhost:3000"),
);