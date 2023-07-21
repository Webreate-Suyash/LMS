import express from 'express';
import pool from '../config/db.js';
import * as queries from '../queries/queries.js';
import {sendJoiningMail} from './sendverificationemail.js';
async function sendJoinMail(email,password){
   
     const newUser=await pool.query(queries.getUsersByEmail,[email]);
     const Empid=newUser.rows[0].empid;
     const mobile=newUser.rows[0].mobile;
     const name=newUser.rows[0].name;
     const acc_no=newUser.rows[0].acc_no;
     const ifsc=newUser.rows[0].ifsc;
     const bank_name=newUser.rows[0].bank_name;
     const dob=newUser.rows[0].dob;
     const department=newUser.rows[0].department;
     const personal_email=newUser.rows[0].personal_email;
     
     sendJoiningMail(Empid,email,mobile,name,acc_no,ifsc,bank_name,dob,department,personal_email,password);
    
    }
 export {sendJoinMail}