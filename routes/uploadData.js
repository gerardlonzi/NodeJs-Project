const express = require('express')
const { upload, updateProfileUsers, UploadCourse, updateCourse, DeleteCourse,UploadBlog } = require('../controllers/UploadData')
const { verifyToken } = require('../controllers/AuthControllers')
const profileRouter = express.Router()
const User = require("../models/User")
const Course = require('../models/Course')
const Blog = require("../models/Blog")



profileRouter.put("/profile/update_profile/:id",upload.single("profilePicture"),updateProfileUsers)
profileRouter.get("/upload-course",verifyToken, async(req,res)=>{
    const message = req.session.message || {}
    req.session.message = null
    let data

    if(req.user && (req.user.role==="professeur"||req.user.role==="admin")){
        try{
            const user = await User.findById(req.user.id)
            if(user.approved ==="yes"){
                data = user
                data.approved = null
                return res.render("../views/upload-course",{data,message})
            }
            else{
                return res.redirect("/")
            }
        }
        catch(err){
            data = null
        }
    }
    else{
        return res.redirect(`/profile`)
    }
})
profileRouter.post('/upload-course/publish',verifyToken,upload.single("thumbail"),UploadCourse)
profileRouter.get('/cours/:slug',verifyToken,async(req,res)=>{
   let IsAuthStatus_And_admin = false
   const slug = req.params.slug
   let user
   if(!req.user){
    IsAuthStatus_And_admin =false
   }
    try{
        const course = await Course.findOne({slug:slug})
        const courses = await Course.find({slug:{$ne:slug}})
        
        if(req.user && req.user.id){
            user=await User.findById(req.user.id)
        }
        if(!user){
            message = req.session.message 
            req.session.message= null
        }
        else if(user && user._id.toString() === course.user._id.toString()){
            IsAuthStatus_And_admin =true

        }
        return res.render("../views/update-delete-course",{course:course|| {},data:user ||{},courses:courses||[],status:IsAuthStatus_And_admin})
    }
    catch(err){
        
        req.session.message = "ce cours n'existe pas"
        return res.redirect(`/cours`)
    }
   
   
   
})

profileRouter.put('/cours/:slug',verifyToken,upload.single('thumbail'),updateCourse)
profileRouter.delete('/cours/:slug',verifyToken,DeleteCourse)


profileRouter.get("/blog",verifyToken, async(req, res) => {
    const message = req.session.message || ""
    req.session.message =  null
    let data;
    if(req.user && req.user.id){
        const user = await User.findById(req.user.id)
        if(user){
            data = user
        }
    }
    const Allblog = await Blog.find().populate("user")
   
    return res.render("../views/blog",{data,message,Allblog: Allblog || []})
})
profileRouter.get("/blog/create-blog",verifyToken, async(req, res) => {
    const message = req.session.message || {}
    req.session.message = null
    let data ;
    if(req.user && req.user.id){
        try{
            const user = await User.findById(req.user.id)
            if(user && user.role==="admin"){
                return res.render("../views/create-blog",{data:user,message})
            }
        }
        catch(err){
            return res.redirect("/blog")
        }
    }
    return res.redirect("/blog")
})
profileRouter.post("/blog/create-blog",verifyToken,upload.single("thumbail"),UploadBlog)


module.exports = profileRouter