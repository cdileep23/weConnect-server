require('dotenv').config();
require('./utils/cronJob')
const express = require("express");
const http=require('http')
const{initializeSocket}=require('./utils/socket')

const authRouter = require("./Routes/auth.js");
const ProfileRouter=require('./Routes/profile.js')
const requestRouter=require('./Routes/request.js')
const userRouter=require('./Routes/userRoute.js')
const chatRouter=require('./Routes/chat.js')
const connectDB = require("./db.js");
var cookieParser = require('cookie-parser')
const cors=require('cors')






const app = express();
const server=http.createServer(app)
initializeSocket(server)
const PORT = process.env.PORT ;
app.use(cors({origin:'http://localhost:5173',credentials:true}))
app.use(cookieParser())
app.use(express.json());
app.use("/", authRouter);
app.use('/', ProfileRouter)
app.use('/',requestRouter)
app.use('/',userRouter)
app.use('/',chatRouter)
app.get("/", (req, res) => {
  res.send("Hello from Vitinder backend");
});

const startServer = async () => {
  try {
     await connectDB();
    console.log("Database connection established...");
    server.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  } catch (err) {
    console.error("Database cannot be connected!!", err);
  }
};

startServer();
