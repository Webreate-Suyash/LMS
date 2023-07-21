import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtTokens } from '../utils/jwt-helpers.js';
import moment from 'moment';
import * as queries from '../queries/queries.js';
import { authenticateToken } from '../middleware/authorization.js';
import { sendvMail, sendJoiningMail } from '../utils/sendverificationemail.js';
import { sendJoinMail } from '../utils/sendJoinMail.js';

const router = express.Router();

router.post('/grievances', async (req, res) => {
    try {
        const Token = req.cookies.access_token;
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

        // Access the user ID from the decoded token
        const Id = decodedToken.id;
        const name = decodedToken.name;
        const email = decodedToken.email;
        let { to, cc, subject, message } = req.body;


        subject = subject + "to " + to + "," + cc;
        console.log(message);
        const approval = true;
        notifi(email, name, subject, message, approval)
        return res.json({ message: "Grievances sent succesfully" });


    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});

async function notifi(email, name, subject, message, approval) {
    const currentDate = new Date();
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const formattedDate = currentDate.toLocaleString('en-IN', options);
    console.log(formattedDate);
    await pool.query(queries.notifyAdmin, [subject, name, email, message, false, approval, formattedDate])
}



export default router;