const passport = require('../controllers/AuthOuth')
const routerAouth = require('express').Router()


routerAouth.get('/google',passport.authenticate('google',{
    scope :['profile','email']
}))
routerAouth.get('/google/callback',passport.authenticate('google',{
    failureRedirect:'/login?error=vous devez vous connectez par email et password comme la prémiere fois',}),(req,res)=>{
        if(req.authInfo && req.authInfo.redirect_url){
                return res.redirect(req.authInfo.redirect_url)
        }
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