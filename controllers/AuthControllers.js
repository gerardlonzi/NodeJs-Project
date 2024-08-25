const User = require("../models/User")
const bcript = require("bcryptjs")
const crypto = require('crypto')
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config()

exports.register = (req, res) => {
  const { email, password } = req.body
  const errors = []

  if (!email) {
    errors.push({ msg: "l'email est requis" })
    return res.render('register', { error_msg_field_email: errors[0].msg, error_msg_field_password: typeof password !== 'undefined' ? "": "le passsword est requis", email: email || "", password: password || "" })


  }
  if (!password) {
    errors.push({ msg: "le passsword est requis" })
    return res.render('register', { error_msg_field_password: "le passsword est requis", password: password, email: email || "" })


  }

  if (password.length < 8) {
    errors.push({ msg: "le mot de paase doit comporter 8 caractere" })
    return res.render('register', { password_length: "le mot de paase doit comporter 8 caractere", password: password, email: email || ""})

  }
  if (errors.length > 0) {
    return res.render('register', { eror_spec: "une erreur s'est produite" })

  }
  else {
    User.findOne({ email }).then(user => {
      if (user) {
        res.render("register", { email_exist: " Desoler cette adresse email existe deja",email: email || "", password: password || ""})
        return
      }
      else {
        const newUser = new User({
          password, email
        })
        bcript.genSalt(10, (err, salt) => {
          console.log("salt"+salt);
          bcript.hash(newUser.password, salt, (err, hash) => {
               if(err) throw err;
               newUser.password = hash
               console.log("hash"+hash);
               newUser.save().then(user=>{
                  const token = jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1h'})
                  res.cookie('token',token,{httpOnly:true,maxAge:3600000})
                  res.redirect('/dashboard')
                  console.log("token"+token);
                  console.log("user id"+user.id);
                  console.log(user);
               }).catch(err=> console.log(err));
          })
        })

      }
    })
  }

}


exports.login = (req,res) =>{
    const {email,password} = req.body
     User.findOne({email}).then(user=>{
    if(!user){
      return res.render('login',{email_notExist:"cet utilisateur n'existe pas veuiller creer un compte", password:password ||"" , email: email|| ""})
    }
    bcript.compare(password,user.password,(err,isvalid)=>{
      if(isvalid){
        const token = jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1h'})
        res.cookie('token',token,{httpOnly:true,maxAge:3600000})
        res.redirect('/')
        console.log("token injecter avec succes");
      }
      else{
        res.render('login',{incorrect_password:"mot de passe incorrect", password:password ||"" , email: email|| ""})
      }
    })
  })
}

exports.verifyToken = (req,res,next)=>{
    const token = req.cookies.token
    console.log(token);
    if(!token){
      
      return res.render('/login')
      
    }

    jwt.verify(token,process.env.JWT_SECRET,(err,data)=>{
      if(err){
        console.log(location);
        return res.render(`${location.pathname}`,{eror_token:"Ouff il s'est produit une erreur"})
      }
      req.user = data
      next()

    })
}