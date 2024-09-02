const express = require("express")
const { register, login, verifyToken, SendEmail, EmailVerified ,EmailIsVerified, forgetpassword, forget_Password_emailVerified, resetPassword, deleteUser, IsAdmin} = require("../controllers/AuthControllers")
const router = express.Router()
const User = require("../models/User")

router.post("/register",register)
router.post("/login",login,(req,res)=>{
    
})
router.get("/",verifyToken,EmailVerified, async(req, res) => {
        console.log(req.user);
        let data ;
        if(req.user){
            try{
                const user = await User.findById(req.user.id)
                data = user
                console.log(user);
            }
            catch(err){
                data = null
            }
        }
        res.render("../views/home",{data:data})
})
router.get("/error", (req, res) => {
    const error_token = req.query.error || "une erreur s'est produite"
    res.render("../views/error",{error_token:error_token})
})
router.get('/profile',verifyToken,EmailVerified,(req,res)=>{
    if(req.user && req.user.role=='user'){
        return res.render("../views/profile")
    }
    else{
        res.redirect("/login")
    }
})
router.get("/login",verifyToken, (req, res) => {
    console.log(req.user);
    
    if(req.user){
        return res.redirect("/")
    }
    else{
        const message = req.session.message || {}
        req.session.message = null

        res.render("../views/authViews/login",{message:message})
    }
})
router.get("/register",verifyToken, (req, res) => {
    if(req.user){
        return res.redirect("/")
    }
    else{
        const message = req.session.message || {}
        req.session.message= null
        res.render("../views/authViews/register",{message:message})
    }
})

router.get('/send-email-verified',verifyToken,async(req,res)=>{
    let data; 
    if( req.user){
        try{
            const user = await User.findById(req.user.id)
            data = user
        }
        catch(err){
            console.log(err);
            data = null
        }
        return res.render('../views/authViews/send-email-verified',{data: data || ""})
    }
    else{
      return  res.redirect('/login')
    }
})
router.post('/send-email-verified',verifyToken,SendEmail)
router.get('/verified-email',EmailIsVerified)
router.get('/forget-password',verifyToken,(req,res)=>{
        if(req.user){
            res.redirect('/')
        }
        else{
            res.render("../views/authViews/forget-password",{error : req.query.error,message:req.query.message})
        }
})
router.post('/forget-password',forgetpassword)
router.get('/reset-password',forget_Password_emailVerified,(req,res)=>{
    return res.render('../views/authViews/reset-password')
})
router.post('/reset-password',resetPassword)
router.get('/logout',(req,res)=>{
    req.logout(err=>{
        if(err){
           return res.redirect('/profile')

        }
        
        res.clearCookie('token')
        return res.redirect('/login')
    })
})

router.delete('/Delete-account',verifyToken,deleteUser)
router.get('/dashboard',verifyToken,IsAdmin,async(req,res)=>{
    let data; 
    if( req.user){
        try{
            const user = await User.findById(req.user.id)
            data = user
             res.render('../views/dashboard',{data:data})
        }
        catch(err){
            console.log(err);
            data = null
        }
    }
    else{
        res.redirect('/')
    }
})

module.exports = router