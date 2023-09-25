import express from 'express'
import configViewEngine from './configs/viewEngine';
import initWebRoute from './route/web'
import MongGoDB from './controller/DataBase/mongoDataBaseController'
const http = require("http");
const { MongoClient, ObjectId } = require("mongodb");

require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const morgan = require('morgan')
const server = http.createServer(app)

// Connection URL User
const urlUser = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.PASSWORD_DATABASE}@cluster0.mrz3qxp.mongodb.net/${process.env.DATABASE_USER}?retryWrites=true&w=majority`;
const clientUser = new MongoClient(urlUser);

// Connection URL Post
const urlPost = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.PASSWORD_DATABASE}@cluster0.mrz3qxp.mongodb.net/${process.env.DATABASE_POST}?retryWrites=true&w=majority`;
const clientPost = new MongoClient(urlPost);

// Connection URL Post
const urlMessage = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.PASSWORD_DATABASE}@cluster0.mrz3qxp.mongodb.net/${process.env.DATABASE_MESAGE}?retryWrites=true&w=majority`;
const clientMessage = new MongoClient(urlMessage);

// DotENV
const port = process.env.PORT;
const dbName = process.env.DATABASE_USER_NAME;
const dataUser = process.env.DATABASE_USER;
const dataPost = process.env.DATABASE_POST;
const dataMessage = process.env.DATABASE_MESAGE;

// Database Name
const dbUser = clientUser.db(dbName);
const dbPost = clientPost.db(dbName);
const dbMessage = clientMessage.db(dbName);


app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(cors()); 

// view enginer
configViewEngine(app)

// router 
initWebRoute(app)

const io = require("socket.io")(server, {
    cors: {
      origin: `${process.env.URL_CLIENT}`,
      methods: ["GET", "POST"]
    }
  });

  const onlineUsers = [];
const notificationUsers = [];
io.on("connection", (socket) => {
  console.log(socket.id, 954);
  socket.on("joinRoom", (data) => {
    console.log("Data received", data, 979);
    socket.join(data);
  });

  //Notification
  socket.on("Notification", async (data) => {
    console.log(data, 852);
    notificationUsers.push(data.userId);
    io.emit("NotificationData", notificationUsers);
    let index = notificationUsers.indexOf(data.userId);
    if (index !== -1) {
      notificationUsers.splice(index, 1);
    }
    if (data.content == "Có Người Nhắn Tin ") {
      console.log(12);
      const User = await CRUD.findById(dbUser, dataUser, data.userId);

      const arrayConnect = User.connect;

      arrayConnect.push(data);

      const UpdateUser = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        data.userId,
        { connect: arrayConnect }
      );
    }
  });
  // Check Offline
  socket.on("checkUserOffline", (data) => {
    // onlineUsers.slice(0,0)
    let index = onlineUsers.indexOf(data.myId);
    if (index !== -1) {
      onlineUsers.splice(index, 1);
    }
    console.log(onlineUsers, 942);
    io.emit("Data check User Online", onlineUsers);
  });
  // Check Online
  socket.on("checkUserOnline", (data) => {
    // onlineUsers.slice(0,0)
    onlineUsers.push(data.myId);
    io.emit("Data check User Online", onlineUsers);
  });
  // Message
  socket.on("DataMessage", async (data) => {
    const findMessage = await CRUD.findById(
      dbMessage,
      dataMessage,
      data.roomId
    );
    const OldMessage = findMessage.message;
    io.to(data.roomId).emit("ServerResponse", { data, OldMessage });
    OldMessage.push(data);
    const updateMessage = await CRUD.updateOneDataAndReturn(
      dbMessage,
      dataMessage,
      data.roomId,
      { message: OldMessage }
    );
  });
});
  
server.listen(process.env.PORT_SOCKET, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT_SOCKET}`);
});

// dataBase
MongGoDB.connectToDB(app)


// 404 
app.use((req,res) => {
    return res.send('Cút')
})


