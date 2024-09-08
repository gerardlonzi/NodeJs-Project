const routerDashboard = require('express').Router()
const User = require('../models/User')

routerDashboard.delete("/user/:id",async(req,res)=>{
    const id = req.params.id
    
    await User.findByIdAndDelete(id).then(()=>{
        req.session.message='utilisateur supprimer avec succes'
        return res.redirect('/dashboard')
    }).catch(err=>{
        req.session.message="une erreur s'est produite veuillez ressayer"
        return res.redirect('/dashboard')

    })
})
routerDashboard.put("/user/role/:id",async(req,res)=>{
    const id = req.params.id
    const {role} = req.body
    
    await User.findByIdAndUpdate(id,{role}).then(()=>{
        req.session.message='role changé avec sucess'
        return res.redirect('/dashboard')
    }).catch(err=>{
        req.session.message="une erreur s'est produite veuillez ressayer"
        return res.redirect('/dashboard')

    })
})

module.exports =routerDashboard