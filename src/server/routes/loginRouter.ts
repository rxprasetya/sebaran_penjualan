import express, { Request, Response } from "express";
import db from "../config/db"
import { users } from "../schema";
import { eq } from "drizzle-orm";
import jwt from 'jsonwebtoken';
import CryptoJS from "crypto-js";

const apiLogin = '/api/login/'
const loginRouter = express.Router();
const SECRET_KEY = process.env.SECRET_KEY!

// Login
loginRouter.post(apiLogin, async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ status: false, message: 'Missing required fields' });
        }

        // Ambil user berdasarkan username
        const user = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .then(rows => rows[0]);

        if (!user) {
            return res.status(401).json({ status: false, message: 'Username or password is incorrect' });
        }

        // Decrypt password dari DB
        const bytes = CryptoJS.AES.decrypt(user.password, SECRET_KEY);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8).replace(/^"|"$/g, '');

        if (decryptedPassword !== password) {
            return res.status(401).json({ status: false, message: 'Username or password is incorrect' });
        }

        // Buat token JWT
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ status: true, message: 'Login successful', data: { username, token } });
    } catch (error: any) {
        res.status(500).json({ status: false, message: 'Internal Server Error: ' + error.message });
    }
});

export default loginRouter