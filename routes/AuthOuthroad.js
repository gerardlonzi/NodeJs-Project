const passport = require('../controllers/AuthOuth')
const routerAouth = require('express').Router()


routerAouth.get('/google',passport.authenticate('google',{
    scope :['profile','email']
}))
routerAouth.get('/google/callback',passport.authenticate('google',{
    failureRedirect:'/',}),(req,res)=>{
        
        res.redirect('/profile')
    }
)


module.exports = routerAouth