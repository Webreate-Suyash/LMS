import express,{json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import cookieParser from 'cookie-parser';
import {dirname,join} from 'path';
import {fileURLToPath} from 'url';
import controllerUser from './src/controllers/controller-user.js';
import controllerAdmin from './src/controllers/controller-admin.js';
import controllerLeave from './src/controllers/controller-leave.js';
import controllerGrievances from './src/controllers/controller-grievances.js';
import controllerNotice from './src/controllers/controller-notice.js';
import controllerProfile from './src/controllers/controller-Profle.js';
import controllerAttendance from './src/controllers/controller-attendance.js';
// import { Server } from 'socket.io';

dotenv.config();


const __dirname = dirname(fileURLToPath(import.meta.url));
const app =express();
const PORT =process.env.PORT || 8000;
const corsOptions = {credentials:true, origin: process.env.URL || '*'};
// const server = http.createServer(app);
// const io = new Server(server);


app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

app.use('/',express.static(join(__dirname,'public')));
app.use('/api/user',controllerUser);
app.use('/api/admin',controllerAdmin);
app.use('/api/Leave',controllerLeave);
app.use('/api/user',controllerGrievances);
app.use('/api/user',controllerNotice);
app.use('/api/user',controllerProfile);
app.use('/api/user',controllerAttendance);



app.listen(PORT, ()=>console.log(`server is listening on ${PORT}`));

// export default io;