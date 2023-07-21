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


router.get('/notice', async (req, res) => {
    try {
        const Token = req.cookies.access_token;
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
        const email = decodedToken.email;
        const notice = await pool.query(queries.getNoticeByEmail,[email]);
        res.send(notice.rows);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
router.post('/notice',async(req,res)=>{
    try{
        const {mark_as_read,id}=req.body;
        pool.query(queries.updateNotice,[mark_as_read,id]);
    }
    catch(error){
        res.status(401).json({ error: error.message });
    }
});

export default router;