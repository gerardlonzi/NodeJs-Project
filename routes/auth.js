const express = require("express")
const { register, login, verifyToken, SendEmail, EmailVerified ,EmailIsVerified, forgetpassword, forget_Password_emailVerified, resetPassword} = require("../controllers/AuthControllers")
const router = express.Router()
const User = require("../models/User")

router.post("/api/auth/register",register)
router.post("/api/auth/login",login,(req,res)=>{
    
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
router.get('/dashboard',verifyToken,EmailVerified,(req,res)=>{
    if(req.user){
        return res.render("../views/dashboard")
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
        res.render("../views/authViews/login")
    }
})
router.get("/register",verifyToken, (req, res) => {
    if(req.user){
        return res.redirect("/")
    }
    else{
        res.render("../views/authViews/register")
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
router.post('/api/auth/forget-password',forgetpassword)
router.get('/reset-password',forget_Password_emailVerified,(req,res)=>{
    return res.render('../views/authViews/reset-password')
})
router.post('/api/auth/reset-password',resetPassword)

module.exports = router