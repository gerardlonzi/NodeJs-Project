const express = require("express")
const User = require("../models/User")
const Course = require("../models/Course")
const Blog = require("../models/Blog")
const { register, login, verifyToken, SendEmail, EmailVerified ,EmailIsVerified, forgetpassword, forget_Password_emailVerified, resetPassword, deleteUser, IsAdmin, SendEmailContact} = require("../controllers/AuthControllers")
const router = express.Router()

router.use(verifyToken,async(req,res,next)=>{
    const token = req.cookies.token
    try{
        if(req.user){
            const user= await User.findById(req.user.id)
            if(!user && token){
             res.clearCookie('token')
             return res.redirect("/")
            }
         }
    }
    catch(err){
        return res.redirect("/error")
    }
    next()
    
})
router.post("/register",register)
router.get("/apply",(req,res)=>{
    return res.render("../views/apply")}
)


router.post("/login",login)
router.get("/",verifyToken,EmailVerified, async(req, res) => {
        let data ;
        let users
        let isLogin = false
        const message = req.session.message || ""
    req.session.message =  null
    console.log('Tentative de récupération des utilisateurs...');
users = await User.find({ role: 'admin' }).limit(6).exec();
        if(req.user){
            isLogin = true
            try{
                const user = await User.findById(req.user.id)
               
                if(user){
                    data = user
                }
                
                
                
            }
            catch(err){
                data = null
            }
        }

        const Recentblogs = await Blog.find().sort({ createdAt: -1 }).populate("user").limit(6).exec();

        
        res.render("../views/home",{data:data,users:users||[],Recentblogs:Recentblogs || [],message,isLogin})
})
router.get("/cours/AllCourse?categorie",async(req,res)=>{
        const categorie = req.query.categorie
        
        if(categorie){
            try{
                let filterCourse = await Course.find({categorie:categorie})
                console.log(filterCourse);
                
                if(filterCourse && filterCourse.length> 0){
                    return res.json(filterCourse || [])
                    
                }
            }
            catch(err){
                res.redirect("/")
                return
            }
        }
        else{
            res.redirect("/")
            return  
        }
        

})
router.get("/error", (req, res) => {
    const error_token = req.query.error || "une erreur s'est produite"
    res.render("../views/error",{error_token:error_token})
})
router.get('/profile',verifyToken,EmailVerified,async(req,res)=>{
    const message = req.session.message || ""
    req.session.message =  null
    let data;
    let course;
    if(!req.user){
        return res.redirect('/')
    }
    const user = await User.findById(req.user.id)
     if(req.user && req.user.role){
        try{
            data = user
            const courseElement = await Course.find({user:req.user.id}).populate('user')
            course = courseElement || []
            return res.render("../views/profile",{data,message,course})
        }
        catch(err){
            data = null
            return
        }
    }
    else{
        return res.redirect("/login")
    }
})
router.get("/login",verifyToken, (req, res) => {
    const error_query = req.query.error 
    if(req.user){
        return res.redirect("/")
    }
    
    else{
        const message = req.session.message || {}
        req.session.message = null

        res.render("../views/authViews/login",{message:message,error:error_query})
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
            res.redirect(`/${req.user.name}`)
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
router.get('/logout',verifyToken, (req,res)=>{
    req.logout(err=>{
        if(err){
           return res.redirect(`/${req.user.name}`)

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
            data = null
        }
    }
    else{
        res.redirect('/')
    }
})
router.get("/cours", async (req, res) => {
    const message = req.session.message || ""
    req.session.message =  null
    let data
    try{
        let tabCategorie =[]
        let courses = await Course.find({approved:"yes"}).populate('user') || [];
        courses?.forEach(blogfilter=>{
    
            if(!tabCategorie.includes(blogfilter.categorie)){
    
                tabCategorie.push(blogfilter.categorie)
    
            }
    
        })
        if(req.user && req.user.id && req.user.id !== 'undefined' && req.user.id !==null){
            const user = await User.findById(req.user.id)
               
            if(user){
                data = user
            }
        }
        
        return res.render("../views/cours",{data:data || null ,courses,tabCategorie:tabCategorie||[],message});
    }
    catch(err){
        return res.redirect("/")
    }
    

});
router.get("/contact", async (req, res) => {
     const message = req.session.message
     req.session.message=""
    let data 
    if(req.user && req.user.id && req.user.id !== 'undefined' && req.user.id !==null ){
    try{
        
            const user = await User.findById(req.user.id)
               
            if(user){
                data = user
           
        }
    }
    catch(err){
        return res.redirect("/")
    }
}
return res.render("../views/contact",{data:data || null,message:message||""});


});

router.get("/professeur", async (req, res) => {
        try{
            let users
            users = await User.find({role:'admin'})
            return res.render("../views/professeur",{users:users||[]})
        }
        catch(err){
            return res.redirect("/")
        }
});

router.post("/send-email",SendEmailContact)

router.get("/:name",verifyToken,async(req,res)=>{
    const slug = req.params.name
   let data
   if(req.user && req.user.id !=="undefined" && req.user.id !==null){
               data =await User.findById(req.user.id) || {}

        }
    try{
        const user = await User.findOne({slug})
        
        if(!user){
           return  res.redirect("/cours")
        }
        else if(req.user &&  req.user.id && user.id===req.user.id){
            return res.redirect("/profile")
        }
       
        const courses= await Course.find({user:user.id}).populate("user")
       
        return res.render("../views/courseTeacherProfile",{user,courses,data})
    }
    catch(err){
        return res.redirect("/cours")
        
    }
})


module.exports = router
