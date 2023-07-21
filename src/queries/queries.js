

//Get query
const getUsersByEmail = "SELECT * FROM users WHERE email=$1";
const getUserById="SELECT * FROM leave WHERE id=$1";
const getLeaveByEmail="SELECT * FROM leave WHERE email=$1";
const getNoticeByEmail="SELECT * FROM notice WHERE email=$1";
const getNotification="SELECT * FROM notification";

//Insert query
const users="INSERT INTO users(email,password,name,token,mobile,dob,department,personal_email,working_from_home) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)";
const insertLeave="INSERT INTO leave(id,empid,name,email,paid_remaining_leave,unpaid_remaining_leave,total_paid_leave,total_unpaid_leave) VALUES($1,$2,$3,$4,$5,$6,$7,$8)";
const notifyAdmin="INSERT INTO notification(subject,name,email,message,mark_as_read,approval,date) VALUES($1,$2,$3,$4,$5,$6,$7)";
const notifyUser="INSERT INTO notice(email,subject,name,message,mark_as_read,date) VALUES($1,$2,$3,$4,$5,$6)";
const insertPayment="INSERT INTO payment(id, empid, p_name, acc_no,ifsc,bank_name,token) VALUES($1,$2,$3,$4,$5,$6,$7)";

//Update Query
const updateAccDetails="UPDATE users SET acc_no=$1,ifsc=$2,bank_name=$3,name=$4 WHERE id=$5";
const updateUserDetails="UPDATE users SET mobile=$1,personal_email=$2 WHERE id=$3";
const updatePassword="UPDATE users SET password=$1, token=$2 WHERE email=$3";
const updateToken = 'UPDATE users SET token = $1 WHERE email = $2';
const updatePaidLeave= "UPDATE leave SET start_date=$1,end_date=$2,reason=$3,no_of_days=$4,paid_remaining_leave=$5,approval=$6 WHERE id=$7";
const updateUnPaidLeave= "UPDATE leave SET start_date=$1,end_date=$2,reason=$3,no_of_days=$4,unpaid_remaining_leave=$5,approval=$6 WHERE Id=$7";
const updateNotification= "UPDATE notification SET mark_as_read=$1 WHERE id=$2 and email=$3";
const updateLeaveApproval= "UPDATE leave SET approval=$1 WHERE email=$2";
const updateNotice="UPDATE notice SET mark_as_read=$1 WHERE id=$2";

//count

const countOfNotification="SELECT COUNT(*) FROM notification WHERE mark_as_read = $1";
const countOfNotice="SELECT COUNT(*) FROM notice WHERE mark_as_read = $1 and email=$2";


export {
    getUsersByEmail,
    updatePassword,
    updateToken,
    updateUserDetails,
    users,
    updateAccDetails,
    insertLeave,
    getUserById,
    updatePaidLeave,
    updateUnPaidLeave,
    notifyAdmin,
    countOfNotification,
    updateNotice,
    notifyUser,
    getNoticeByEmail,
    countOfNotice,
    getNotification,
    updateNotification,
    updateLeaveApproval,
    getLeaveByEmail,
    insertPayment,
};