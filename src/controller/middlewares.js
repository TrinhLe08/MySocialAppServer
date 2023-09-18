const { MongoClient } = require('mongodb');
import CRUD from './DataBase/CRUD'
require('dotenv').config();
import fs from 'fs'
require('dotenv').config();
const multer = require('multer');

console.log(process.env.DATABASE_NAME, process.env.PASSWORD_DATABASE, process.env.DATABASE_USER_NAME);

// Connection URL User
const urlUser = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.PASSWORD_DATABASE}@cluster0.mrz3qxp.mongodb.net/${process.env.DATABASE_USER}?retryWrites=true&w=majority`;
const clientUser = new MongoClient(urlUser);


// Connection URL Post
const urlPost = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.PASSWORD_DATABASE}@cluster0.mrz3qxp.mongodb.net/${process.env.DATABASE_POST}?retryWrites=true&w=majority`;
const clientPost = new MongoClient(urlPost);

// DotENV
const dbName = process.env.DATABASE_USER_NAME   
const port = process.env.PORT
const dataUser = process.env.DATABASE_USER
const dataPost = process.env.DATABASE_POST

// Database Name
const dbUser = clientUser.db(dbName);
const dbPost = clientPost.db(dbName);


 const middlewareLogin = (req, res, next) => {
    console.log(req.body);
    if (req.body.username && req.body.password) {
        console.log('Thành công from middlewareLogin ')
        next()
    } else {
        console.log('Thất Bại')
        return res.send('Cút')
    }
  }

  const middlewareRegister = async ( req, res, next ) => {

    const user = await CRUD.findOneName(dbUser, dataUser, req.body.username);

    if (!user) {
        next()
    } else {
        return res.status(201).send('No 201 from middlewareRegister')
    }

  } 


  // Check UpLoad Img

        const UPLOAD_IMG = 'UPLOAD_IMG/'

      if (!fs.existsSync(UPLOAD_IMG)) {
        fs.mkdirSync(UPLOAD_IMG)
      }

      const CheckUpdateUser = multer.diskStorage({
        destination: (req, file, cb) => {
           cb(null, UPLOAD_IMG)
        },
        filename: (req, files, cb) => {
           const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
           const fileExtension = files.originalname.split(".").pop();
           const originalFilename = files.originalname.split(".")[0];
           const filename = `${originalFilename}-${uniqueSuffix}.${fileExtension}`;
           cb(null, filename);
         }
     })
     
      const uploadImg = multer({ storage : CheckUpdateUser});

  // Check Update Password 

  const MiddlewareUpdatePassword = async (req, res, next) => {
    const data = req.body 

    console.log(data);

    const User = await CRUD.findById(dbUser, dataUser, data.userId)

    if (User && User.password == data.values.oldPassword) {
      return next()
    } else if(User.password != data.values.oldPassword){
      console.log(13);
      return res.status(201).send('Sai mẹ rồi ')
    }
  }

  // Post file

  const checkUpLoad = (req, res, next) => {
      upload.single('file')(req, res, (err) => {
        if (err) {
          console.log(err);
          return res.send({ Error: 'Lỗi trong quá trình tải file' });
        }
        if (!req.file) {
          console.log(12);
          return next()
        }
      });
  }
  const CheckPost = multer.diskStorage({
    destination: (req, file, cb) => {
       cb(null, UPLOAD_IMG)
    },
    filename: (req, files, cb) => {
       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
       const fileExtension = files.originalname.split(".").pop();
       const originalFilename = files.originalname.split(".")[0];
       const filename = `${originalFilename}-${uniqueSuffix}.${fileExtension}`;
       cb(null, filename);
     }
 })
 
  const upPost = multer({ storage : CheckPost});


  module.exports ={
    middlewareLogin,
    middlewareRegister,
    uploadImg,
    upPost,
    MiddlewareUpdatePassword
  }
//   API1( Chứa thông tin người dùng ) -- > [Oject {
//     id : <Đã tự động tạo>
//     name,
//     password: <Mã hóa>,
//     linkAvartar,
//     capOfPost,
//     file,
//     numberOfPost,
//     numberOfFollow,
//     numberOfLike,
//     numberOfDislike,
//     numberOfComment,
// }]
