require("dotenv").config();
import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { createServer } from "http";
const { MongoClient, ObjectId } = require("mongodb");
import CRUD from "./CRUD";
const multer = require("multer");
const http = require("http");
const app = express();
const server =  createServer(app);

// cloudiary
cloudinary.config({
  cloud_name: "dmhp8qe91",
  api_key: "133445781532437",
  api_secret: "FERj63eLZezLhwWfOPiWCExdLcc",
});

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

async function connectToDB(app) {
  try {
    await Promise.all([clientUser.connect(), clientPost.connect()]);

    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Unable to connect to MongoDB", error);
  }
}

const RegisterUser = async (req, res) => {
  const user = await CRUD.findOneName(dbUser, dataUser, req.body.username);

  try {
    await Promise.all([clientUser.connect(), clientPost.connect()]);

    const user = {
      name: req.body.username,
      password: req.body.password,
      linkImg: req.body.linkImg,
      linkAvatar: req.body.linkAvatar,
      address: req.body.address,
      connect: req.body.connect,
      checkConnect: req.body.checkConnect,
      friend: req.body.friend,
      numberOfPost: req.body.numberOfPost,
      numberOfFollow: req.body.numberOfFollow,
      numberOfLike: req.body.numberOfLike,
      numberOfDislike: req.body.numberOfDislike,
      numberOfComment: req.body.numberOfComment,
    };

    await CRUD.createOneData(dbUser, dataUser, user);

    return res.status(200).send({ Yes: "Yes" });
  } catch (error) {
    console.log("Unable to connect to MongoDB", error);
  }
};

const LoginUser = async (req, res) => {
  console.log(req.body);
  try {
    await Promise.all([clientUser.connect(), clientPost.connect()]);
    // Kiểm tra đầu vào
    if (!req.body.username || !req.body.password) {
      res.status(403).send({ message: "Thiếu thông tin!" });
    }
    // Tìm kiếm
    const user = await CRUD.findOneName(dbUser, dataUser, req.body.username);
    if (!user) {
      console.log(11);
      return res.status(201).json({ message: "Not Foud" });
    } else if (user.password != req.body.password || user.name != req.body.username) {
      console.log("No 400 from Login User");
      return res.status(201).send({ message: "No 201 from Login User" });
    } else if (user.password === req.body.password) {
      // Token
      const token = jwt.sign(
        { username: user.username, password: user.password },
        process.env.KEY_JWT
      );
      // View Post
      const View = await CRUD.viewData(dbPost, dataPost);
      let arrayView = View.sort((a, b) => b.numberOflike - a.numberOflike);
      let top5Post = arrayView.slice(0, 5);
      // Lọc ra số bài đã like
      const ViewPost = View.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(user._id.toString()),
      }));

      const myPost = ViewPost.filter(
        (oject) => oject.userId === user._id.toString()
      );

      // All Users To Find
      const AllUsers = await CRUD.viewData(dbUser, dataUser);

      // Delete Password
      AllUsers.forEach((obj) => {
        delete obj.password;
      });
      delete user.password;
      return res
        .status(200)
        .send({ user, token, ViewPost, myPost, user, AllUsers, top5Post });
    } 
  } catch (error) {
    console.log(error);
  }
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
};

const FindUser = async (req, res) => {
  try {
    await Promise.all([clientUser.connect(), clientPost.connect()]);
    console.log(req.body.username);
    if (!req.body.username) {
      res.status(403).send({ message: "Thiếu thông tin!" });
      console.log("Thiếu thông tin!");
    }
    const user = await CRUD.findOneName(dbUser, dataUser, req.body.username);
    console.log(user, "from Find Name");
    if (user) {
      return res.status(200).send(useruser);
    }
  } catch (err) {
    console.log(err);
  }
};

const ViewOneUser = async (req, res) => {
  try {
    console.log(req.body);
    const User = await CRUD.findById(dbUser, dataUser, req.body.myId);
    console.log(User, 163);
    if (User) {
      return res.send({ User });
    }
  } catch (err) {
    console.log(err);
  }
};

// Upload Img
const UpdateImgUser = async (req, res) => {
  try {
    // Lấy file từ client
    const files = req.files;
    // Id User
    const userId = req.body.userId;
    const userName = req.body.userName;
    const userAddress = req.body.userAddress;
    console.log(req.body, "from UpdateImgUserBody");
    console.log(files, "from UpdateImgUser");
    let imageUrls = [];
    const filesArray = Object.values(files);

    // Đẩy lên cloud để lấy url
    for (let file of filesArray) {
      for (let f of file) {
        // Đẩy từng file lên cloud để lấy url
        const resultCloudinary = await cloudinary.uploader.upload(f.path, {
          resource_type: "auto",
          folder: "UploadAvatar",
        });
        // Lấy url
        let imgUrl = resultCloudinary.secure_url;
        // push vào mảng imageUrls
        imageUrls.push(imgUrl);
        //Xóa từng ảnh đã lưu
        fs.unlinkSync(f.path);
      }
    }

    if (
      typeof req.body.fileAvatar === "string" &&
      typeof req.body.fileImg != "string"
    ) {
      const ValueUpdate = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        userId,
        {
          linkAvatar: req.body.fileAvatar,
          linkImg: imageUrls[0],
          name: userName,
          address: userAddress,
        }
      );

      return res.send(ValueUpdate);
    } else if (
      typeof req.body.fileImg === "string" &&
      typeof req.body.fileAvatar != "string"
    ) {
      const ValueUpdate = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        userId,
        {
          linkAvatar: imageUrls[0],
          linkImg: req.body.fileImg,
          name: userName,
          address: userAddress,
        }
      );

      return res.send(ValueUpdate);
    } else if (
      typeof req.body.fileImg === "string" &&
      typeof req.body.fileAvatar === "string"
    ) {
      const ValueUpdate = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        userId,
        {
          linkAvatar: req.body.fileAvatar,
          linkImg: req.body.fileImg,
          name: userName,
          address: userAddress,
        }
      );

      return res.send(ValueUpdate);
    }

    setTimeout(async () => {
      const ValueUpdate = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        userId,
        {
          linkAvatar: imageUrls[0],
          linkImg: imageUrls[1],
          name: userName,
          address: userAddress,
        }
      );

      return res.send(ValueUpdate);
    }, 4000);
  } catch (err) {
    console.log(err);
  }
};

// Update Password
const UpdatePassword = async (req, res) => {
  try {
    const data = req.body.values;

    const User = await CRUD.updateOneData(dbUser, dataUser, req.body.userId, {
      password: data.newPassword,
    });

    console.log(User);

    delete User.password;

    return res.send({ Vip: "done" });
  } catch (err) {
    console.log(err);
  }
};

// up Post *
const UpPost = async (req, res) => {
  try {
    if (!req.file) {
      const userId = req.body.userId;
      const post = {
        name: req.body.userName,
        userId: userId,
        linkAvatar: req.body.linkAvatar,
        capOfPost: req.body.content,
        arrayLike: [],
        like: false,
        time: req.body.time,
        linkImg: null,
        numberOflike: 0,
        numberOfComment: 0,
        comment: [],
      };

      const result = await CRUD.createOneData(dbPost, dataPost, post);

      if (result.acknowledged) {
        // View Post
        const View = await CRUD.viewData(dbPost, dataPost);
        // Update User
        const User = await CRUD.findById(dbUser, dataUser, userId);
        const numberPost = User.numberOfPost;
        const UserUpdate = await CRUD.updateOneDataAndReturn(
          dbUser,
          dataUser,
          userId,
          { numberOfPost: numberPost + 1 }
        );
        // Filter Like
        const ViewPost = View.map((obj) => ({
          ...obj,
          like: obj.arrayLike.includes(userId),
        }));
        // Filter My Post
        const updatedViewPost = View.filter((oject) => oject.userId === userId);
        // Filter Like My Post
        const myPost = updatedViewPost.map((obj) => ({
          ...obj,
          like: obj.arrayLike.includes(userId),
        }));
        console.log(myPost, "my Post 283");
        return res.send({ ViewPost, myPost, UserUpdate });
      }
    }

    // Lấy file từ client
    const files = req.file;
    // Id User
    const userId = req.body.userId;
    // Đẩy lên cloud để lấy url
    const resultCloudinary = await cloudinary.uploader.upload(files.path, {
      resource_type: "auto",
      folder: "UploadAvatar",
    });
    // Lấy url
    let imgUrl = resultCloudinary.secure_url;
    //Xóa ảnh đã lưu
    fs.unlinkSync(files.path);

    const post = {
      name: req.body.userName,
      userId: userId,
      linkAvatar: req.body.linkAvatar,
      capOfPost: req.body.content,
      time: req.body.time,
      linkImg: imgUrl,
      arrayLike: [],
      like: false,
      numberOflike: 0,
      numberOfComment: 0,
      comment: [],
    };

    const result = await CRUD.createOneData(dbPost, dataPost, post);

    console.log(result.acknowledged);
    if (result.acknowledged) {
      // View Post
      const View = await CRUD.viewData(dbPost, dataPost);
      // Update User
      const User = await CRUD.findById(dbUser, dataUser, userId);
      const numberPost = User.numberOfPost;
      const UserUpdate = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        userId,
        { numberOfPost: numberPost + 1 }
      );
      // Filter Like
      const ViewPost = View.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(userId),
      }));
      // Filter My Post
      const updatedViewPost = View.filter((oject) => oject.userId === userId);
      // Filter Like My Post
      const myPost = updatedViewPost.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(userId),
      }));
      console.log(myPost, "my Post 283");
      return res.send({ ViewPost, myPost, UserUpdate });
    } else {
      return res.send({ Errors: "Lỗi mẹ rồi" });
    }
  } catch (err) {
    console.log(err);
  }
};

// view Post
const ViewPost = async (req, res) => {
  try {
    const userId = req.body.userId;

    const View = await CRUD.viewData(dbPost, dataPost);
    // Lọc ra số bài đã like
    const ViewPost = View.map((obj) => ({
      ...obj,
      like: obj.arrayLike.includes(userId),
    }));

    console.log(ViewPost, 391);

    if (ViewPost.length < 5) {
      var TopPost = ViewPost.sort(function (a, b) {
        return b.numberOflike - a.numberOflike;
      }).slice(0, ViewPost.length);
      return res.send({ ViewPost, TopPost });
    }

    var TopPost = ViewPost.sort(function (a, b) {
      return b.numberOflike - a.numberOflike;
    }).slice(0, 5);

    console.log(TopPost, 393);

    return res.send({ ViewPost, TopPost });
  } catch (err) {
    console.log(err);
  }
};

// up DataPost for User
const upDataPost = async (req, res) => {
  try {
    const data = req.body;

    console.log(data);

    const userId = data.userId;

    const User = await CRUD.findById(dbUser, dataUser, userId);

    if (User) {
      const UpdatePostUser = await CRUD.updateOneData(dbUser, dataUser, userId);

      if (UpdatePostUser.lastErrorObject.updatedExisting) {
        const newValue = User;
        console.log(newValue, "from user post new Value");
        const ViewPost = await CRUD.viewData(dbPost, dataPost);
        return res.send({ ViewPost });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

// DeletePost
const DeletePost = async (req, res) => {
  try {
    if (req.body.postId) {
      // Id Post & User
      const postId = req.body.postId;
      const userId = req.body.userId;
      // Xóa Post
      const deletePost = await CRUD.deleteOneData(dbPost, dataPost, postId);
      // View Of Post
      const View = await CRUD.viewData(dbPost, dataPost);
      // Update User
      const User = await CRUD.findById(dbUser, dataUser, userId);
      const numberPost = User.numberOfPost;
      const UserUpdate = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        userId,
        { numberOfPost: numberPost - 1 }
      );
      // Filter Like
      const ViewPost = View.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(userId),
      }));

      const updatedViewPost = ViewPost.filter(
        (oject) => oject.userId === userId
      );
      const myPost = updatedViewPost.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(userId),
      }));

      console.log(myPost, 482);

      return res.send({ ViewPost, myPost, UserUpdate });
    }
  } catch (err) {
    console.log(err);
  }
};

// Like
const LikePost = async (req, res) => {
  try {
    const data = req.body;
    const like = data.setLike;
    const userId = data.userId;
    const postId = data.postId;

    if (like) {
      // Find Post
      const post = await CRUD.findById(dbPost, dataPost, postId);

      const arrayLike = post.arrayLike;
      const numberLike = post.numberOflike;
      arrayLike.push(userId);
      // Update Post + Id User
      const updateNumberLike = await CRUD.updateOneDataAndReturn(
        dbPost,
        dataPost,
        postId,
        { numberOflike: numberLike + 1, arrayLike: arrayLike }
      );
      // Update User
      const User = await CRUD.findById(dbUser, dataUser, userId);
      const numberLikeUser = User.numberOfLike;
      const UserUpdate = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        userId,
        { numberOfLike: numberLikeUser + 1 }
      );
      // View Post
      const ViewPost = await CRUD.viewData(dbPost, dataPost);
      const updatedViewPost = ViewPost.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(userId),
      }));
      // My Post
      const filterMyPost = ViewPost.filter((oject) => oject.userId === userId);
      const myPost = filterMyPost.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(userId),
      }));
      console.log(myPost, "my Post 318");
      return res.send({ updatedViewPost, myPost, UserUpdate });
      // Un Like -->
    } else if (!like) {
      // Find Post
      const post = await CRUD.findById(dbPost, dataPost, postId);
      const arrayLike = post.arrayLike;
      const numberLike = post.numberOflike;
      let indexToDeleteLike = arrayLike.indexOf(userId);
      console.log(indexToDeleteLike, 566);
      arrayLike.splice(indexToDeleteLike, 1);
      // Update Post
      const updateNumberLike = await CRUD.updateOneDataAndReturn(
        dbPost,
        dataPost,
        postId,
        { numberOflike: numberLike - 1, arrayLike: arrayLike }
      );
      console.log(updateNumberLike, "476");
      // Update User
      const User = await CRUD.findById(dbUser, dataUser, userId);
      const numberLikeUser = User.numberOfLike;
      const UserUpdate = await CRUD.updateOneDataAndReturn(
        dbUser,
        dataUser,
        userId,
        { numberOfLike: numberLikeUser - 1 }
      );
      // ViewPost
      const ViewPost = await CRUD.viewData(dbPost, dataPost);
      const updatedViewPost = ViewPost.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(userId),
      }));
      const filterMyPost = ViewPost.filter((oject) => oject.userId === userId);
      const myPost = filterMyPost.map((obj) => ({
        ...obj,
        like: obj.arrayLike.includes(userId),
      }));
      console.log(myPost, "my Post 318");
      return res.send({ updatedViewPost, myPost, UserUpdate });
    }
  } catch (err) {
    console.log(err);
  }
};

// View Comment
const ViewComment = async (req, res) => {
  try {
    const postId = req.body.postId;

    const Post = await CRUD.findById(dbPost, dataPost, postId);

    const ViewComment = Post.comment;

    console.log(ViewComment, "ViewComment");

    return res.send(ViewComment);
  } catch (err) {
    console.log(err);
  }
};

// Comment
const CommentPost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.body.userId;
    const data = {
      userId: req.body.userId,
      linkAvatar: req.body.linkAvatar,
      name: req.body.name,
      content: req.body.content,
    };

    const post = await CRUD.findById(dbPost, dataPost, postId);

    const arrayComment = post.comment;
    const numberComment = post.numberOfComment;

    console.log(arrayComment, "arrayComment");

    arrayComment.push(data);

    console.log(arrayComment, "arrayComment2");

    const updateCommentPost = await CRUD.updateOneDataAndReturn(
      dbPost,
      dataPost,
      postId,
      { comment: arrayComment, numberOfComment: numberComment + 1 }
    );

    // Update User
    const User = await CRUD.findById(dbUser, dataUser, userId);
    const numberCommentUser = User.numberOfComment;
    const UserUpdate = await CRUD.updateOneDataAndReturn(
      dbUser,
      dataUser,
      userId,
      { numberOfComment: numberCommentUser + 1 }
    );

    console.log(updateCommentPost, "updateCommentPost");

    const ViewPost = await CRUD.viewData(dbPost, dataPost);

    const updatedViewPost = ViewPost.map((obj) => ({
      ...obj,
      like: obj.arrayLike.includes(userId),
    }));

    const myPost = ViewPost.filter((oject) => oject.userId === userId);

    return res.send({ arrayComment, updatedViewPost, myPost, UserUpdate });
  } catch (err) {
    console.log(err);
  }
};

// Other Profile
const OtherProfile = async (req, res) => {
  // *
  try {
    console.log(req.body);
    const userId = req.body.userId;
    const myId = req.body.myId;
  
    const User = await CRUD.findById(dbUser, dataUser, userId);

    console.log(User, 638);
  
    const View = await CRUD.viewData(dbPost, dataPost);
  
    const ViewPost = View.filter((oject) => oject.userId === userId);
  
    let connectUser = User.connect.find((user) => user.userId === myId);
  
    let connectUserForFale = User.connect.find((user) => user.myId === myId);

    const friendOfUser = User.friend.find((user) => user.userId === myId);
  
    console.log(friendOfUser,connectUser, 692);
  
    if (friendOfUser !== undefined && friendOfUser !== false  ) {
      connectUser = true;
    }
  
    if (friendOfUser == undefined && connectUserForFale != undefined) {
      connectUser = false;
    }
    console.log(connectUser, 682);
  
    const OtherUserProfile = Object.assign(User, {
      Post: ViewPost,
      checkConnect: connectUser,
    });
  
    return res.send({ OtherUserProfile });
  } catch ( err) {
    console.log( err);
  }
};

// ConnectFriend
const ConnectFriend = async (req, res) => {
  try {
    const userId = req.body.userId;

    const myId = req.body.myId;

    const dataToConnect = req.body.dataUser;

    const User = await CRUD.findById(dbUser, dataUser, userId);

    const arrayConnect = User.connect;

    arrayConnect.push(dataToConnect);

    const UpdateUser = await CRUD.updateOneDataAndReturn(
      dbUser,
      dataUser,
      userId,
      { connect: arrayConnect }
    );
    let connectUser = UpdateUser.connect.find((user) => user.userId === userId);

    const View = await CRUD.viewData(dbPost, dataPost);

    const ViewPost = View.filter((oject) => oject.userId === userId);

    if (connectUser !== undefined) {
      connectUser = false;
    }
    const OtherUserProfile = Object.assign(UpdateUser, {
      Post: ViewPost,
      checkConnect: connectUser,
    });
    console.log(connectUser, 725);
    return res.send({ OtherUserProfile });
  } catch (err) {
    console.log(err);
  }
};

// DeleteConnect
const DeleteConnect = async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.body.userId;
    const myId = req.body.myId;
    const Or = req.body.or;
  
    const Me = await CRUD.findById(dbUser, dataUser, myId);
    const Friend = await CRUD.findById(dbUser, dataUser, userId);
  
    const arrayConnect = Me.connect;
    const myArrayFriend = Me.friend;
    const arrayFriendToPush = Friend.friend;
  
    const connectUser = arrayConnect.find((user) => user.userId === myId);
  
    if (connectUser) {
      if (Or) {
        arrayConnect.map((oject) => {
          if (oject.myId == userId) {
            arrayConnect.splice(arrayConnect.indexOf(oject), 1);
          }
        });
        const numberFriend = Friend.numberOfFollow + 1;
        const dataFriend = {
          userId: userId,
          name: Friend.name,
          linkAvatar: Friend.linkAvatar,
          numberOfPost: Friend.numberOfPost,
          numberOfFollow: Friend.numberOfFollow,
        };
        myArrayFriend.push(dataFriend);
        const numberOfMyFriend = Me.numberOfFollow + 1;
  
        const myData = {
          userId: myId,
          name: Me.name,
          linkAvatar: Me.linkAvatar,
          numberOfPost: Me.numberOfPost,
          numberOfFollow: Me.numberOfFollow,
        };
        arrayFriendToPush.push(myData);
  
        const MyUpdate = await CRUD.updateOneDataAndReturn(
          dbUser,
          dataUser,
          myId,
          {
            connect: arrayConnect,
            friend: myArrayFriend,
            numberOfFollow: numberOfMyFriend,
          }
        );
  
        const friendUpdate = await CRUD.updateOneDataAndReturn(
          dbUser,
          dataUser,
          userId,
          {
            connect: arrayConnect,
            friend: arrayFriendToPush,
            numberOfFollow: numberFriend,
          }
        );
        return res.send({ MyUpdate });
      } else {
        arrayConnect.map((oject) => {
          if (oject.myId == userId) {
            console.log(oject.name);
            arrayConnect.splice(arrayConnect.indexOf(oject), 1);
          }
        });
        const MyUpdate = await CRUD.updateOneDataAndReturn(
          dbUser,
          dataUser,
          myId,
          { connect: arrayConnect }
        );
        return res.send({ MyUpdate });
      }
    }
  } catch(err) {
    console.log(err);
  }

  return;
};

// DeleteFriend
const DeleteFriend = async (req, res) => {
  try {
    console.log(req.body, 754);
    const userId = req.body.userId;
    const myId = req.body.myId;
  
    const Me = await CRUD.findById(dbUser, dataUser, myId);
    const Friend = await CRUD.findById(dbUser, dataUser, userId);
  
    const MyArrayFriend = Me.friend;
  
    const numberFriend = Friend.numberOfFollow - 1;
    let valueToDelete = MyArrayFriend.find(f => f.userId === userId);
    console.log(valueToDelete, 857);
    let indexToDelete = MyArrayFriend.indexOf(valueToDelete); 
    console.log(indexToDelete, 864);
    MyArrayFriend.splice(indexToDelete, 1);
    const numberOfMyFriend = Me.numberOfFollow - 1;
  
    const myData = {
      userId: myId,
      name: Me.name,
      linkAvatar: Me.linkAvatar,
      numberOfPost: Me.numberOfPost,
      numberOfFollow: Me.numberOfFollow,
    };
    const arrayFriendToPush = Friend.friend;
    let myValueToDelete = arrayFriendToPush.find(m => m.userId === myId)
    let myIndexToDelete = arrayFriendToPush.indexOf(myValueToDelete); 
    arrayFriendToPush.splice(myIndexToDelete, 1);
  
    const MyUpdate = await CRUD.updateOneDataAndReturn(dbUser, dataUser, myId, {
      friend: MyArrayFriend,
      numberOfFollow: numberOfMyFriend,
    });
  
    const friendUpdate = await CRUD.updateOneDataAndReturn(
      dbUser,
      dataUser,
      userId,
      {
        friend: arrayFriendToPush,
        numberOfFollow: numberFriend,
      }
    );
    return res.send({ MyUpdate });
  } catch ( err) {
    console.log(err);
  }
};

// MessageId
const ConnectIdRom = async (req, res) => {
  try {
    const userX = req.body.userX;
    const userY = req.body.userY;

    const findMessage = await CRUD.findUserId(
      dbMessage,
      dataMessage,
      userX,
      userY
    );

    if (!findMessage) {
      const CreadId = await CRUD.createOneData(dbMessage, dataMessage, {
        userX: req.body.userX,
        userY: req.body.userY,
        message: [],
      });
      const IdRoom = CreadId.insertedId.toString();
      console.log(CreadId.insertedId.toString(), 824);
      return res.send({ IdRoom, message: [] });
    } else {
      const IdRoom = findMessage._id.toString();
      console.log(findMessage.message, 829);
      return res.send({ IdRoom, OldMessage: findMessage.message });
    }
  } catch (err) {
    console.log(err);
  }
};

// Suggesst To FindUser
const SuugestUser = async (req, res) => {
  try {
    const myId = req.body.myId;

    const AllUsers = await CRUD.viewData(dbUser, dataUser);

    const User = await CRUD.findById(dbUser, dataUser, myId);

    console.log(User, 891);

    console.log(AllUsers.length);

    const Suggests = AllUsers.filter((user) =>
      user.friend.find((f) => f.userId === myId)
    );

    console.log(Suggests, 877);

    Suggests.forEach((suggest) => {
      const index = AllUsers.indexOf(suggest);
      console.log(index);
      if (index > -1) {
        AllUsers.splice(index, 1);
      }
    });

    const AllUsersSuggest = AllUsers.filter(
      (suggest) => suggest._id.toString() != myId
    );

    console.log(AllUsersSuggest, 911);

    return res.send({ AllUsersSuggest });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  connectToDB,
  RegisterUser,
  LoginUser,
  FindUser,
  ViewOneUser,
  UpdateImgUser,
  UpdatePassword,
  ViewPost,
  UpPost,
  upDataPost,
  DeletePost,
  LikePost,
  SuugestUser,
  ViewComment,
  CommentPost,
  OtherProfile,
  ConnectFriend,
  DeleteConnect,
  DeleteFriend,
  ConnectIdRom,
};
