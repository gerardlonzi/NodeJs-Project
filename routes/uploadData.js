const express = require('express')
const { upload, updateProfileUsers, UploadCourse } = require('../controllers/UploadData')
const { verifyToken } = require('../controllers/AuthControllers')
const profileRouter = express.Router()
const User = require("../models/User")
const Course = require('../models/Course')



profileRouter.put("/profile/update_profile/:id",upload.single("profilePicture"),updateProfileUsers)
profileRouter.get("/upload-course",verifyToken, async(req,res)=>{
    console.log("upload-request"+req.user);
    const message = req.session.message || {}
    console.log(message);
    
    req.session.message = null
    let data
    if(req.user && req.user.role==="professeur"){
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
        return res.redirect("/profile")
    }
})
profileRouter.post('/upload-course/publish',verifyToken,upload.single("thumbail"),UploadCourse)
profileRouter.get('/profile/cours/:slug',verifyToken,async(req,res)=>{
   const slug = req.params.slug
   let message
   if(req.user && req.user.role==="professeur"){
    try{
        const user = await User.findById(req.user.id)
        if(!user){
            message,req.session.message = "vous n'êtes pas autorisé a voir ce cours "
            req.session.message=null
            return res.redirect("/profile")
        }
        else{
          const course = await Course.find({slug:slug})
          if(course){
            return res.render("../views/update-delete-course",{course})
          }
          else{
            req.session.message = "ce cours n'existe pas"
            return res.redirect("/profile")

          }
        }
    }
    catch(err){
        req.session.message = "vous n'êtes pas autorisé a voir ce cours "
        return res.redirect("/profile")
    }
   }
   
   
})

module.exports = profileRouter