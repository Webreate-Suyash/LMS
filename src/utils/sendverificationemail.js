import nodemailer from 'nodemailer';

const transporter =nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'saumyaagarw@gmail.com',
        pass: 'nohduxkzcebufchr',
    }
});

function sendvMail(email){
    
    const currentUrl="http://localhost:8000/api/user/"
    const mailOptions={
        from: '"Suyash Singhal" <saumyaagarw@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `<p>Verify your Email ddress to complete the registration process.</p>
                <b>Click <a href =${currentUrl + "user/verify/"+email}>here</a> to complete the verification process.</b>`
    };
    transporter.sendMail(mailOptions,(error,info)=>{
        if(error){
            console.error('Error sending email:',error);
        }
        else{
            console.log('Email sent:',info.response);
        }
    });
}

function sendJoiningMail(Empid,email,mobile,name,acc_no,ifsc,bank_name,dob,department,personal_email,password){
        const currentUrl="http://localhost:8000/api/admin/"
        const mailOptions={
            from: '"Suyash Singhal" <saumyaagarw@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: `<p>Check your details and Click on Join</p>
                   <p>Employee Id: ${Empid}</p>
                   <p>Employee Name: ${name}</p>
                   <p>Password: ${password}</p>
                   <p>Mobile: ${mobile}</p>
                   <p>Department: ${department}</p>
                   <p>Personal Email: ${personal_email}</p>
                   <p>Date of Birth: ${dob}</p>
                   <p>Bank Name: ${bank_name}</p>
                   <p>Account no.: ${acc_no}</p>
                   <p>Ifsc Code: ${ifsc}</p>

                    <b>Click <a href =${currentUrl + "user/verify/"+email}>JOIN</a> to complete the registration process.</b>`
};
    transporter.sendMail(mailOptions,(error,info)=>{
        if(error){
            console.error('Error sending email:',error);
        }
        else{
            console.log('Email sent:',info.response);
        }
    })
};

export {sendvMail,sendJoiningMail}
