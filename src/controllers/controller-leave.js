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

router.post('/leave', async (req, res) => {
    try {
        const Token = req.cookies.access_token;
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

        // Access the user ID from the decoded token
        const Id = decodedToken.id;
        const name = decodedToken.name;
        const email = decodedToken.email;
        const { start_date, end_date, reason, category } = req.body;
        const data = await pool.query(queries.getUserById, [Id]);
        if (data.rows.length === 0) return res.status(401).json({ error: "Email is incorrect" });
        let start_date_Array = data.rows[0].start_date;
        let end_date_Array = data.rows[0].end_date;
        let no_of_days_Array = data.rows[0].no_of_days;
        let approval_Array = data.rows[0].approval;
        let reason_Array = data.rows[0].reason;
        let paid_remaining_leave = data.rows[0].paid_remaining_leave;
        let unpaid_remaining_leave = data.rows[0].unpaid_remaining_leave;
        let no_of_day = calculateDaysBetweenDates(start_date, end_date);
        let test = false;
        paid_remaining_leave = paid_remaining_leave - no_of_day;
        unpaid_remaining_leave = unpaid_remaining_leave - no_of_day;
        if (start_date_Array === null) {
            test = true;
        }
        if (test) {
            start_date_Array = [start_date];
            end_date_Array = [end_date];
            no_of_days_Array = [no_of_day];
            approval_Array = [false];
            reason_Array = [reason];
        }
        else {
            start_date_Array[start_date_Array.length] = start_date;
            end_date_Array[end_date_Array.length] = end_date;
            no_of_days_Array[no_of_days_Array] = no_of_day;
            approval_Array[approval_Array.length] = false;
            reason_Array[reason_Array.length] = reason;
        }
        if (category === 'paid' || category === 'medical') {
            if (no_of_day > paid_remaining_leave) return res.status(401).json({ error: "You dont have enough paid leaves" });
            else {
                pool.query(queries.updatePaidLeave, [start_date_Array, end_date_Array, reason_Array, no_of_days_Array, paid_remaining_leave, approval_Array, Id]);
            }
        }
        if (category === 'unpaid') {
            if (no_of_day > unpaid_remaining_leave) return res.status(401).json({ error: "You dont have enough unpaid leaves" });
            else {
                pool.query(queries.updateUnPaidLeave, [start_date_Array, end_date_Array, reason_Array, no_of_days_Array, paid_remaining_leave, approval_Array, Id]);
            }
        }

        const subject = "Leave Approval.";
        const approvals = false;
        const message = "Hello sir/mam, I want to apply for " + category + " leave ,Please approve my leave for the following reason " + reason + " for the " + no_of_day + " days from " + start_date + " to " + end_date;
        console.log(message);
        notifi(email, name, subject, message, approvals);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});


function calculateDaysBetweenDates(startDate, endDate) {
    // Convert the input strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the time difference in milliseconds
    const timeDiff = Math.abs(end - start);

    // Convert the time difference to days
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return days;
}



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