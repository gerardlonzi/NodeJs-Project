const passport = require('../controllers/AuthOuth')
const routerAouth = require('express').Router()


routerAouth.get('/google',passport.authenticate('google',{
    scope :['profile','email']
}))
routerAouth.get('/google/callback',passport.authenticate('google',{
    failureRedirect:'/login',}),(req,res)=>{
        if(req.user.role =='user' || req.user.role =='professeur'){
            return res.redirect('/profile')
        }
        if(req.user.role = 'admin'){
            return res.redirect('/dashboard')
        }
        else{
            return res.redirect('/login')
        }
    }
)


module.exports = routerAouth