import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtTokens } from '../utils/jwt-helpers.js';
import moment from 'moment';
// import queries from '../src/queries.js';
import * as queries from '../queries/queries.js';
// import io from '../index.js';
import { sendvMail, sendJoiningMail } from '../utils/sendverificationemail.js';
import { sendJoinMail } from '../utils/sendJoinMail.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;
        const emails = email.toLowerCase();
        if (!emails.includes('@webreate.com')) return res.status(401).json({ error: "Enter only Webreate Email ID" });
        const users = await pool.query(queries.getUsersByEmail, [emails]);
        if (users.rows.length === 0) return res.status(401).json({ error: "Email is incorrect" });
        if (users.rows[0].token !== true) return res.status(401).json({ error: "user is not verified yet" });
        const validPassword = await bcrypt.compare(password, users.rows[0].password);
        if (!validPassword) return res.status(401).json({ error: "Incorrect Password" });
        let date_time = new Date();
        let day = ("0" + date_time.getDate()).slice(-2);;
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        var date = (day + '-' + month + '-' + year);
        let id = users.rows[0].empid;
        //nam =users.rows[0].name;
        //const newUser = await pool.query('INSERT INTO date_time(empid,name,date,login_status,logout_status,Break_in_status,Break_out_status) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        //[id,nam,date,false,false,false,true]);
        let tokens = jwtTokens(users.rows[0]);
        res.cookie('access_token', tokens.accessToken, { httpOnly: true });
        res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });

        return res.json(tokens);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});

router.get('/count', async (req, res) => {

    const Token = req.cookies.access_token;
    const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
    const email = decodedToken.email;
    const result = await pool.query(queries.countOfNotice, [false, email]);
    const rowCount = result.rows[0].count;
    res.send(`${rowCount}`);
});

router.get('/user/verify/:email', (req, res) => {
    const email = req.params.email;
    const token = true;
    console.log(email);
    console.log(token);
    savetoken(email, token);
    function savetoken(email, token) {
        if (token === true) {
            pool.query(queries.updateToken, [token, email]);
        }
    };
    res.send(`Token verified: ${token}`);
});

router.put('/forgot_password', async (req, res) => {
    try {
        const token = false;
        const { email, password, repeatPassword } = req.body;
        const emails = email.toLowerCase();
        const users = await pool.query(queries.getUsersByEmail, [emails]);
        if (users.rows.length === 0) return res.status(401).json({ error: "Email is not Registered with us" });
        if (password !== repeatPassword) return res.status(401).json({ error: "Password does not match" });
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        sendvMail(email);
        pool.query(queries.updatePassword, [hashedPassword, token, emails]);
        return res.json({ message: "Verify your mail." });
    }
    catch (error) {
        const errorResponse = {
            error: true,
            message: 'Email is not Registered with us',
        };
        res.status(500).json(errorResponse);
        res.status(490).json({ error: error.message });
    }

});

router.get('/refresh_token', (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;

        if (refreshToken === null) return res.sendStatus(401);
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
            if (error) return res.status(403).json({ error: error.message });
            let tokens = jwtTokens(user);
            res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });
            return res.json(tokens);
        });
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }

});


router.delete('/refresh_token', (req, res) => {
    try {

        res.clearCookie('refresh_token');
        res.clearCookie('access_token');
        return res.status(200).json({ message: 'refresh and access token deleted' })
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});




export default router;