const express = require("express")
const { register, login, verifyToken, SendEmail, EmailVerified ,EmailIsVerified, forgetpassword, forget_Password_emailVerified, resetPassword, deleteUser, IsAdmin} = require("../controllers/AuthControllers")
const router = express.Router()
const User = require("../models/User")
const Course = require("../models/Course")

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
router.get('/profile',verifyToken,EmailVerified,async(req,res)=>{
    console.log('requser'+ req.user);
    const message = req.session.message || ""
    req.session.message =  null
    let data;
    let course;
     if(req.user && (req.user.role==='user' || req.user.role==='professeur')){
        try{
            const user = await User.findById(req.user.id)
            data = user
            const courseElement = await Course.find({user:req.user.id}).populate('user')
            course = courseElement || []
            console.log(user);
            return res.render("../views/profile",{data,message,course})
        }
        catch(err){
            data = null
        }
    }
    else{
        return res.redirect("/login")
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
    const message = req.session.message
    req.session.message=null
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
        return res.render('../views/authViews/send-email-verified',{data: data || "",message:message||{}})
    }
    else{
      return  res.redirect('/login')
    }
})
router.post('/send-email-verified',verifyToken,SendEmail)
router.get('/verified-email',EmailIsVerified)
router.get('/forget-password',verifyToken,(req,res)=>{
    const message = req.session.message
    req.session.message =null
        if(req.user){
            res.redirect('/')
        }
        else{
            res.render("../views/authViews/forget-password",{message:message||{}})
        }
})
router.post('/forget-password',forgetpassword)
router.get('/reset-password',forget_Password_emailVerified,(req,res)=>{
    const message = req.session.message

    return res.render('../views/authViews/reset-password',{message:message||{}})
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
    const { fromDate, toDate } = req.query;
    const dateNow = new Date().toISOString().slice(0,10)
    let data; 
    if( req.user){
        try{
            const user = await User.findById(req.user.id)
            data = user
            let allUsers;
            let usersVerifie;
            let usersNotVerified;
            let allUserlastmont;
            let UserVerifielastmont;
            let UserNotVerifielastmont;

            if (fromDate && toDate) {
                const from = new Date(fromDate);
                const to = new Date(toDate) 

                allUsers = await User.countDocuments({
                    createdAt: { $gte: from, $lte: to }
                });
                usersVerifie = await User.countDocuments({
                    emailVerified: true,
                    createdAt: { $gte: from, $lte: to }
                });
                usersNotVerified = await User.countDocuments({
                    emailVerified: false,
                    createdAt: { $gte: from, $lte: to }
                });
                allUserlastmont = await User.countDocuments({
                    createdAt: { $gte: from.setDate(from.getDay()-7), $lte: to.setDate(to.getDay()-7) }
                });
                UserVerifielastmont = await User.countDocuments({
                    emailVerified: true,
                    createdAt: { $gte:from.setDate(from.getDay()-7), $lte: to.setDate(to.getDay()-7) }
                });
                UserNotVerifielastmont = await User.countDocuments({
                    emailVerified: false,
                    createdAt: { $gte: from.setDate(from.getDay()-7), $lte: to.setDate(to.getDay()-7) }
                });
            } else {
                allUsers = await User.countDocuments();
                usersVerifie = await User.countDocuments({
                    emailVerified: true
                });
                usersNotVerified = await User.countDocuments({
                    emailVerified: false
                });
            }
            const usersElem = await User.find()

            res.render('../views/dashboard', {
                data: data,
                allUsers: allUsers,
                usersNotVerified: usersNotVerified,
                usersVerifie: usersVerifie,
                fromDate:fromDate,
                toDate:toDate,
                dateNow:dateNow,
                usersElem:usersElem,
                allUserlastmont:allUserlastmont,
                UserVerifielastmont:UserVerifielastmont,
                UserNotVerifielastmont:UserNotVerifielastmont
            });
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
