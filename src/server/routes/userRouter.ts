import express, { Request, Response } from "express";
import db from "../config/db"
import CryptoJS from "crypto-js";
import { users } from "../schema";
import { eq } from "drizzle-orm";

const userRouter = express.Router();
const SECRET_KEY = process.env.SECRET_KEY!
const apiUsers = '/api/users/'

// Users
userRouter.get(apiUsers, async (req: Request, res: Response) => {
    try {
        const data = await db.select({ name: users.name, username: users.username }).from(users)
        res.status(200).json({ status: true, message: 'List Users Data', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

userRouter.get(apiUsers + 'search/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const data = await db.select({ name: users.name, username: users.username }).from(users).where(eq(users.id, id))
        if (data.length === 0) res.status(404).json({ status: false, message: 'Data Not Found!' })
        res.status(200).json({ status: true, message: 'Found it', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

userRouter.post(apiUsers + 'create', async (req: Request, res: Response) => {
    const data = {
        name: req.body.name,
        username: req.body.username,
        password: CryptoJS.AES.encrypt(JSON.stringify(req.body.password), SECRET_KEY).toString(),
    }
    if (!data.name || !data.username || !data.password) res.status(422).json({ status: false, message: 'Missing required fields' });
    try {
        await db.insert(users).values(data)
        res.status(200).json({ status: true, message: 'Successfully added user', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error ' + error.message })
    }
})

userRouter.patch(apiUsers + 'update/:id', async (req: Request, res: Response) => {

    const id = parseInt(req.params.id)
    const data = {
        name: req.body.name,
        username: req.body.username,
        password: CryptoJS.AES.encrypt(JSON.stringify(req.body.password), SECRET_KEY).toString(),
    }
    if (!data.name || !data.username || !data.password) res.status(422).json({ status: false, message: 'Missing required fields' });
    try {
        await db.update(users).set(data).where(eq(users.id, id))
        res.status(200).json({ status: true, message: 'Sucessfully updated user', data })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
    }
})

userRouter.delete(apiUsers + 'delete/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        await db.delete(users).where(eq(users.id, id))
        res.status(200).json({ status: true, message: 'Successfully deleted user' })
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal server error ' + error.message })
    }
})

export default userRouter