const passport = require('../controllers/AuthOuth')
const routerAouth = require('express').Router()


routerAouth.get('/google',passport.authenticate('google',{
    scope :['profile','email']
}))
routerAouth.get('/google/callback',passport.authenticate('google',{
    failureRedirect:'/',}),(req,res)=>{
        if(req.user.role =='user'){
            return res.redirect('/profile')
        }
        if(req.user.role = 'admin'){
            res.redirect('/dashboard')
        }
    }
)


module.exports = routerAouth