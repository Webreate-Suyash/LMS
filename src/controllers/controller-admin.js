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



router.get('/',authenticateToken,async (req,res)=>{
    try{
        const users=await pool.query('SELECT * FROM users');
        res.json({users:users.rows});
    }
    catch(error){
       res.status(500).json({error:error.message});
    }
});





router.post('/register', async (req, res) => {
    try {
        const token = false;
        const { email, password, repeatPassword, name, mobile, acc_no, confirm_acc_no, ifsc, bank_name, dob, department, personal_email, location ,p_name} = req.body;
        //there should be a drop down menu in frontend to select the location with two options working_from_home or working_from_office
        let working_from_home = false;
        if (req.body.location === working_from_home) {
            working_from_home = true;
        }
        const emails = req.body.email.toLowerCase();
        const personal_emails = req.body.personal_email.toLowerCase();
        if (!email.includes('@webreate.com')) return res.status(401).json({ error: "Enter only Webreate Email ID" });
        if (password !== repeatPassword) return res.status(401).json({ error: "Password does not match" });
        if (acc_no !== confirm_acc_no) return res.status(401).json({ error: "Account number. does not match" });
        const regex = /^\d{10}$/; // Regular expression pattern for exactly 10 digits
        if (regex.test(mobile) !== true) return res.status(401).json({ error: "Enter valid mobile number" });
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await pool.query(queries.users,
            [emails, hashedPassword, name, token, mobile, dob, department, personal_emails, working_from_home]);
        Leave(emails);
        Payment(emails,acc_no,ifsc,bank_name,p_name);
        sendJoinMail(emails, password);
        res.json({ users: newUser.rows[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// router.put('/updateProfile',async (req,res)=>{
//     try{
//         const token = false;
//         const {email, password,repeatPassword,name,mobile,acc_no,confirm_acc_no,ifsc,bank_name,dob,department,personal_email,location} = req.body;
//         //there should be a drop down menu in frontend to select the location with two options working_from_home or working_from_office
//         let working_from_home=false;
//         if(req.body.location===working_from_home){
//             working_from_home=true;
//         }
//         const emails= req.body.email.toLowerCase();
//         const personal_emails= req.body.personal_email.toLowerCase();
//         //const personal_emails=req.body.personal_email.toLowerCase();
//         if(!email.includes('@webreate.com'))return res.status(401).json({error: "Enter only Webreate Email ID"});
//         if(password!==repeatPassword) return res.status(401).json({error:"Password does not match"});
//         if(acc_no!==confirm_acc_no) return res.status(401).json({error:"Account number. does not match"});
//         const regex = /^\d{10}$/; // Regular expression pattern for exactly 10 digits
//         if(regex.test(mobile)!==true) return res.status(401).json({error:"Enter valid mobile number"});
//         const hashedPassword = await bcrypt.hash(req.body.password,10);
//         const newUser = await pool.query(queries.users,
//         [emails,hashedPassword,name,token,mobile,acc_no,ifsc,bank_name,dob,department,personal_emails,working_from_home]);
//         Leave(emails);
//         sendJoinMail(emails,password);
//         res.json({users:newUser.rows[0]});
//     }
//     catch(error){
//         res.status(500).json({error:error.message});
//     }
// });

async function Leave(email) {
    const userId = await pool.query(queries.getUsersByEmail, [email]);
    const id = userId.rows[0].id;
    const name = userId.rows[0].name;
    const empid = userId.rows[0].empid;
    const leave = 11;
    const reply = pool.query(queries.insertLeave, [id, empid, name, email, leave, leave, leave, leave]);

}
async function Payment(email,acc_no,ifsc,bank_name,p_name){
    const userId = await pool.query(queries.getUsersByEmail, [email]);
    const id = userId.rows[0].id;
    const empid = userId.rows[0].empid;
    const reply =pool.query(queries.insertPayment,[id,empid,p_name,acc_no,ifsc,bank_name,false]);

}
async function attendance(){

}
router.post('/notification', async (req, res) => {
    try {
        const { id, email, subject, mark_as_read, token } = req.body;
        if (subject === "Leave Approval.") {
            leaveApproval(email, token);
        }

        pool.query(queries.updateNotification, [mark_as_read, id, email]);

    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});


async function leaveApproval(email, token) {
    const details = await pool.query(queries.getLeaveByEmail, [email]);
    let approvals = details.rows[0].approval;
    let approvalLeangth = details.rows[0].approval.length;
    approvals[approvalLeangth - 1] = token;

    await pool.query(queries.updateLeaveApproval, [approvals, email]);
}


router.get('/count', async (req, res) => {

    const result = await pool.query(queries.countOfNotification, [false]);
    const rowCount = result.rows[0].count;
    res.send(`${rowCount}`);


});
router.get('/notification', async (req, res) => {
    try {

        const notice = await pool.query(queries.getNotification);
        res.send(notice.rows);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }

});



router.post('/notice', async (req, res) => {
    try {
        const { subject, message, email, name } = req.body;
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
        pool.query(queries.notifyUser, [email, subject, name, message, false, formattedDate])
        return res.json({ message: "Notice sent Succesfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
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




export default router;