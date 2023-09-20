import express from "express"
import jwt from 'jsonwebtoken'
import MongGoDB from '../controller/DataBase/mongoDataBaseController'
import Middleware from '../controller/middlewares'
let router = express.Router()

require('dotenv').config();

const keyToken =  process.env.KEY_JWT

const initWebRoute = (app) => {
    // Login
    router.post('/v/login', Middleware.middlewareLogin, MongGoDB.LoginUser )
    // Find
    router.post('/v/findUser', MongGoDB.FindUser)
     // Find
     router.post('/v/view-one-user', MongGoDB.ViewOneUser)
    // Resgister
    router.post('/v/register',Middleware.middlewareRegister, MongGoDB.RegisterUser)
    // Check and Update Avatar + Img
    router.post('/v/check-user-update', Middleware.uploadImg.fields([{ name: 'fileImg', maxCount: 1 }, 
                                                                    { name: 'fileAvatar', maxCount: 1 }]), MongGoDB.UpdateImgUser)
    // Check and Update Password
    router.post('/v/check-user-update-password', Middleware.MiddlewareUpdatePassword, MongGoDB.UpdatePassword )
    // View Post
    router.post('/v/view-post', MongGoDB.ViewPost)
    // Up Post
    router.post('/v/up-Post', Middleware.upPost.single('upPost'), MongGoDB.UpPost)
    // My Post
    router.post('/v/up-Post-User', MongGoDB.upDataPost)
    // Delete Post
    router.post('/v/up-Delete-Post', MongGoDB.DeletePost)
    // Like Post
    router.post('/v/like-Post', MongGoDB.LikePost)
    // Comment
    router.post('/v/view-comment-Post', MongGoDB.ViewComment)
    
    router.post('/v/comment-Post', MongGoDB.CommentPost)
    // Find User
    router.post('/v/view-suggest-user', MongGoDB.SuugestUser)
    // Other Profile
    router.post('/v/other-user-profile', MongGoDB.OtherProfile)
    // Connect + Friend
    router.post('/v/connect-friend', MongGoDB.ConnectFriend)

    router.post('/v/delete-connect', MongGoDB.DeleteConnect)

    router.post('/v/delete-friend', MongGoDB.DeleteFriend)
    // Room Id to Message
    router.post('/v/connect-id-room', MongGoDB.ConnectIdRom)

    return app.use('/', router)
}

export default initWebRoute;

