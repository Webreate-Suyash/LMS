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



router.put('/updateUserDetails', async (req, res) => {
    try {
        const Token = req.cookies.access_token;
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

        // Access the user ID from the decoded token
        const userId = decodedToken.id;

        const { mobile, personal_email } = req.body;
        const emails = personal_email.toLowerCase();
        const regex = /^\d{10}$/; // Regular expression pattern for exactly 10 digits
        if (regex.test(mobile) !== true) return res.status(401).json({ error: "Enter valid mobile number" });
        pool.query(queries.updateUserDetails, [mobile, emails, userId])
        return res.json({ message: "Details Updated Succesfully." });
    }
    catch (error) {
        const errorResponse = {
            error: true,
            message: 'Details are not able to save',
        };
        res.status(500).json(errorResponse);
        res.status(490).json({ error: error.message });
    }

});


router.put('/updateAccDetails', async (req, res) => {
    try {
        const Token = req.cookies.access_token;
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

        // Access the user ID from the decoded token
        const userId = decodedToken.id;
        const email = decodedToken.email;
        const { acc_no, confirm_acc_no, ifsc, bank_name, name } = req.body;
        const subject = "Approval for updating Account details.";
        const approval = false;
        const message = "Hello sir/mam, I want to update my Account details, Please approve the details I have provided." + "  Acoount no.= " + acc_no + "  IFSC code= " + ifsc + "  Bank Name= " + bank_name;
        console.log(message);
        notifi(email, name, subject, message);
        if (acc_no !== confirm_acc_no) return res.status(401).json({ error: "Account no. does not match" });
        pool.query(queries.updateAccDetails, [acc_no, ifsc, bank_name, name, userId])
        return res.json({ message: "Details sent to admin for verification." });
    }
    catch (error) {
        const errorResponse = {
            error: true,
            message: 'Details are not able to save',
        };
        res.status(500).json(errorResponse);
        res.status(490).json({ error: error.message });
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