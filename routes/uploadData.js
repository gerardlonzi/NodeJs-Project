const express = require('express')
const { upload, updateProfileUsers, UploadCourse } = require('../controllers/UploadData')
const { verifyToken } = require('../controllers/AuthControllers')
const profileRouter = express.Router()
const User = require("../models/User")



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
profileRouter.get('/profile/cours/:id',verifyToken,async(req,res){
   const id = req.params.id
   
})


module.exports = profileRouter