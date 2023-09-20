import express from 'express'
import configViewEngine from './configs/viewEngine';
import initWebRoute from './route/web'
import MongGoDB from './controller/DataBase/mongoDataBaseController'
import { Server } from 'socket.io'
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require("cors");
const http = require('http');

const app = express();
const morgan = require('morgan')
const server = http.createServer(app)

app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
  }));
app.options('*', cors());

// view enginer
configViewEngine(app)

// router 
initWebRoute(app)

// dataBase
MongGoDB.connectToDB(app)


// 404 
app.use((req,res) => {
    return res.send('404 Not Foud')
})


