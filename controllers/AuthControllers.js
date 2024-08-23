const User = require("../models/User")
const bcript = require('bcrypt')
const crypto = require('crypto')
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const { log } = require("console")

dotenv.config()

exports.register = (req, res) => {
  const { email, password } = req.body
  const errors = []

  if (!email) {
    errors.push({ msg: "l'email est requis" })
    return res.render('register', { error_msg_field_email: errors[0].msg, error_msg_field_password: typeof password !== 'undefined' ? "" : "le passsword est requis", email: email || "", password: password || "",pageTitle:"Register" })


  }
  if (!password) {
    errors.push({ msg: "le passsword est requis" })
    return res.render('register', { error_msg_field_password: "le passsword est requis", password: password, email: email || "",pageTitle:"Register" })


  }

  if (password.length < 8) {
    errors.push({ msg: "le mot de paase doit comporter 8 caractere" })
    return res.render('register', { password_length: "le mot de paase doit comporter 8 caractere", password: password, email: email || "",pageTitle:"Register" })

  }
  if (errors.length > 0) {
    return res.render('register', { eror_spec: "une erreur s'est produite" })

  }
  else {
    User.findOne({ email }).then(user => {
      if (user) {
        res.render("register", { email_exist: " Desoler cette adresse email existe deja" ,pageTitle:"Register"})
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
               newUser.save().then(user=>{
                  const token = jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1h'})
                  console.log(token);
                  console.log(user);
               }).catch(err=> console.log(err));
          })
        })

      }
    })
  }

}