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

router.put('/PunchIn', async (req, res) => {
    try {
    
      
      const token = req.cookies.access_token;
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

     // Access the user ID from the decoded token
      const userId = decodedToken.empid;
     
    // Example: Print the extracted user ID
      
      let date_time = new Date();
      let day =  ("0" + date_time.getDate()).slice(-2);;
      let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
      let year = date_time.getFullYear();
      var date=(year + '-' + month + '-' + day);
      const status=await pool.query('SELECT * FROM date_time WHERE empid=$1 AND date=$2',[userId,date]);
      
      
      let hours = date_time.getHours();
      let minutes = date_time.getMinutes();
      let seconds = date_time.getSeconds();
      var login_time=(hours+':'+minutes+':'+seconds);
      


      // Execute the update query

      if(status.rows[0].login_status===false){const updateQuery = 'UPDATE date_time SET login = $1, login_status = $2 WHERE empid = $3 AND date = $4';
      await pool.query(updateQuery, [login_time, true, userId, date]);
  
      res.status(200).json({ message: 'Employee updated successfully' });
    }
    } catch (err) {
      console.error('Error updating employee:', err);
  res.status(500).json({ error: 'An error occurred while updating the employee' });
    }
  });


  //Break in
  router.put('/BreakIn', async (req, res) => {
    try {
      const token = req.cookies.access_token;
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken.empid;
      let date_time = new Date();
      let day =  ("0" + date_time.getDate()).slice(-2);;
      let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
      let year = date_time.getFullYear();
      var date=(year + '-' + month + '-' + day);
      let hours = date_time.getHours();
      let minutes = date_time.getMinutes();
      let seconds = date_time.getSeconds();
      var Break_in_time=(hours+':'+minutes+':'+seconds);
    

      const attendance = await pool.query('SELECT * FROM date_time WHERE empid=$1 AND date=$2', [userId, date]);
      let myArray = attendance.rows[0].break_in;
      let test=false;
      if(myArray===null){
       test=true;
      }
       if(test){
         myArray=[Break_in_time];
          console.log(myArray); 
       }
       else{
       myArray[myArray.length] = Break_in_time;
       console.log(myArray); 
       } 
      // Execute the update query
      if(attendance.rows[0].login_status===true&&attendance.rows[0].logout_status===false&&attendance.rows[0].break_in_status===false&&attendance.rows[0].break_out_status===true){
      const updateQuery = 'UPDATE date_time SET break_in =$1,break_in_status=$2,break_out_status=$3 WHERE empid = $4 AND date = $5';
      await pool.query(updateQuery, [myArray,true,false, userId, date])
      .then(() => {
                 console.log('Array column updated successfully');
        })
        .catch(error => {
        console.error('Error updating array column:', error);
        });
  
      res.status(200).json({ message: 'Employee updated successfully' });
      }
      else{
        res.status(500).json({ message: 'Punch In First or break out' });
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      res.status(500).json({ error: 'An error occurred while updating the employee' });
    }
  });

  //BreakOut
  router.put('/BreakOut', async (req, res) => {
    try {
      const token = req.cookies.access_token;
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken.empid;
      let date_time = new Date();
      let day =  ("0" + date_time.getDate()).slice(-2);;
      let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
      let year = date_time.getFullYear();
      let date=(year + '-' + month + '-' + day);
      let hours = date_time.getHours();
      let minutes = date_time.getMinutes();
      let seconds = date_time.getSeconds();
      var Break_Out_time=(hours+':'+minutes+':'+seconds);
      const attendance = await pool.query('SELECT * FROM date_time WHERE empid=$1 AND date=$2', [userId, date]);
        //calculate total_break_time
       
       let myArray = attendance.rows[0].break_out;
       let test=false;
       if(myArray===null){
        test=true;
       }
        if(test){
          myArray=[Break_Out_time];

        }
        else{
        myArray[myArray.length] = Break_Out_time;
  
        }
        
        let array1=attendance.rows[0].break_in;
        const newArray=[];
        for (let i = 0; i < array1.length; i++) {
          let time1=array1[i];
          let time2=myArray[i];
          newArray[i]=timeDifference(time2,time1);
        }
        
         let total_break_time=newArray[0];
         for (let i = 1; i < newArray.length; i++) {
                  total_break_time=timeSum(total_break_time,newArray[i]);
        }
        
      // Execute the update query
      if(attendance.rows[0].login_status===true&&attendance.rows[0].logout_status===false&&attendance.rows[0].break_in_status===true&&attendance.rows[0].break_out_status===false){
      const updateQuery = 'UPDATE date_time SET break_out = $1,total_break_time=$2,break_in_status=$3,break_out_status=$4,break_time=$5 WHERE empid = $6 AND date = $7';
      await pool.query(updateQuery, [myArray,total_break_time,false,true,newArray,userId, date]);
      
       
      res.status(200).json({ message: 'Employee updated successfully' });
      }
      else{
        res.status(500).json({ message: 'Punch In First or you Are already on break.' });
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      res.status(500).json({ error: 'An error occurred while updating the employee' });
    }
  });

//punch out
router.put('/PunchOut', async (req, res) => {
  try {
    const token = req.cookies.access_token;
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decodedToken.empid;
    let date_time = new Date();
    let day = ("0" + date_time.getDate()).slice(-2);;
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    let year = date_time.getFullYear();
    var date = (year + '-' + month + '-' + day);
    let hours = date_time.getHours();
    let minutes = date_time.getMinutes();
    let seconds = date_time.getSeconds();
    var logout_time = (hours + ':' + minutes + ':' + seconds);
    const attendance = await pool.query('SELECT * FROM date_time WHERE empid=$1 AND date=$2', [userId, date]);
    if(attendance.rows[0].logout_status===false){
    if (attendance.rows.length === 0) return res.status(401).json({ error: "userid and date " });
    //calculate total_break_time
    const format = 'HH:mm:ss';
    const total_break_time = attendance.rows[0].total_break_time;
    
    //calculate total_working_hours_apart_from_break_time;
    var time1 = attendance.rows[0].login;
    const diff = moment.duration(moment(logout_time, format).diff(moment(time1, format)));
    const diffHours = diff.hours();
    const diffMinutes = diff.minutes();
    const diffSeconds = diff.seconds();
    var working_hours = (diffHours + ':' + diffMinutes + ':' + diffSeconds);
    //calculate total_working_hours
    const diff_of_time = moment.duration(moment(working_hours, format).diff(moment(total_break_time, format)));
    const Hours = diff_of_time.hours();
    const Minutes = diff_of_time.minutes();
    const Seconds = diff_of_time.seconds();
    var total_working_hours = (Hours + ':' + Minutes + ':' + Seconds);

    // Execute the update query
    const updateQuery = 'UPDATE date_time SET logout = $1, logout_status = $2 ,total_working_time=$3,total_break_time=$4 WHERE empid = $5 AND date = $6';
    await pool.query(updateQuery, [logout_time, true, total_working_hours, total_break_time, userId, date]);
    res.status(200).json({ message: 'Employee updated successfully' });
    }



  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'An error occurred while updating the employee' });
  }
});




export default router;