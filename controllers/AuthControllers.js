const User = require("../models/User")
const bcript = require("bcryptjs")
const crypto = require('crypto')
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const nodemailer = require("nodemailer")

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
                  res.redirect('/send-email-verified')
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
    if (!email) {
      return res.render('login', {error_msg_field_email: typeof email !== 'undefined' ? "": "l'email est requis"  ,error_msg_field_password: typeof password !== 'undefined' ? "": "le passsword est requis", email: email || "", password: password || "" })
  
  
    }
    if (!password) {
      return res.render('login', { error_msg_field_password: "le passsword est requis", password: password, email: email || "" })
    }
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
      
        return next()
    }

    jwt.verify(token,process.env.JWT_SECRET,async(err,data)=>{
      if(err){
        return res.redirect("/error?error=token invalide ou expirer veuiller vous reconnecter")
      }
      req.user = data
      return next()

      
    })
}

exports.sendMailContain = (options)=>{
  const transporter = nodemailer.createTransport({
    service:"Gmail",
    auth:{
      user : process.env.EMAIL_NODE,
      pass:process.env.PASSWORD
    }
  })
  const mail_options ={
    from:process.env.EMAIL_NODE,
    to:options.email,
    subject:options.subject,
    html:options.message
  }
  return transporter.sendMail(mail_options)

}

exports.EmailVerified = async(req,res,next)=>{
  const userAuth = req.user
  if(!userAuth){
    return next()
  }

  try{
    const verifiedEmailVerified = await User.findById(req.user.id)
    if(verifiedEmailVerified.emailVerified !== true){
      return res.redirect('/send-email-verified?message="vous devez verifier votre email address')
    }
    return next()
  }
  catch(err){
    return res.redirect("/error?error=une erreur s'est produit")

  }

}

exports.SendEmail = async(req,res)=>{
  try{
  const user= await User.findById(req.user.id)
    if(!user){
      return res.redirect("/error?error= utilisateur non approuver")
    }

    const token = crypto.randomBytes(20).toString('hex')
    user.emailVerifiedToken = token
    user.emailVerifiedTokenExpire = Date.now() + 3600000
    await user.save()
    const url =  `http://${req.headers.host}/verified-email?${token}`
    const options = {
      email : user.email,
      subject : "GL dev : Verification de votre adresse email",
      message:`<p>veuiller cliquer sur ce lien 👇🏼👇🏼 pour verifier votre addresse email \n ${url}</p>`
    }
    this.sendMailContain(options).then(result=>{
      console.log(result);
  }).catch(err=>{
    console.log(err);
  })
  }
  catch(err){
    return res.redirect("/error?error=une erreur s'est produiter")
  }
    


}