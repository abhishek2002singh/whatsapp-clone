const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
const cors = require('cors')


dotenv.config(); 

const app = express();
const port = process.env.PORT || 7777

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));




app.get('/', (req, res) => {
    res.send("Hi, this is my backend");
});

// route define is here
const routerph = require('./router/route')
app.use('/' , routerph)

const dbConnect = require('./config/database');
const initializeSocket = require('./utils/socket');

// socket logic here

const http = require('http')
const server = http.createServer(app)
initializeSocket(server)


dbConnect().then(() => {
    console.log('Connection successful');
    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
        console.log(port)
      });
}).catch(err => {
    console.error('Database connection failed:', err);
});

