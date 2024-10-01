const User = require("../models/User")
const bcript = require("bcryptjs")
const crypto = require('crypto')
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const nodemailer = require("nodemailer")
const cloudinary = require("../config/cloudinary")
const Course = require("../models/Course")
const { default: mongoose } = require("mongoose")

dotenv.config()

exports.register = (req, res) => {
  const { email, password } = req.body
  const errors = []

  if (!email) {
    errors.push({ msg: "l'email est requis" })
    req.session.message = {
      error_msg_field_email: errors[0].msg,
      error_msg_field_password: typeof password !== 'undefined' ? "" : "le passsword est requis",
      email: email || "",
      password: password || ""

    }
    return res.redirect('/register')


  }
  if (!password) {
    req.session.message = {
      error_msg_field_password: "le passsword est requis",
      password: password,
      email: email || ""
    }
    errors.push({ msg: "le passsword est requis" })
    return res.redirect('register')


  }

  if (password.length < 8) {
    req.session.message = { password_length: "le mot de paase doit comporter 8 caractere", password: password, email: email || "" }
    errors.push({ msg: "le mot de paase doit comporter 8 caractere" })

    return res.redirect('register')

  }
  if (errors.length > 0) {
    req.session.message = { eror_spec: "une erreur s'est produite" }
    return res.redirect('register')

  }
  else {
    User.findOne({ email }).then(user => {
      if (user) {
        req.session.message = { email_exist: " Desoler cette adresse email existe deja", email: email || "", password: password || "" }
        res.redirect("register")
        return
      }
      else {
        const newUser = new User({
          password, email
        })
        bcript.genSalt(10, (err, salt) => {
          console.log("salt" + salt);
          bcript.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash
            console.log("hash" + hash);

            newUser.save().then(user => {
              const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '5h' })
              res.cookie('token', token, { httpOnly: true, maxAge: 21600000 })
              res.redirect('/send-email-verified')
              console.log("token" + token);
              console.log("user id" + user.id);
              console.log(user);
            }).catch(err => console.log(err));
          })
        })

      }
    })
  }

}


exports.login = (req, res) => {
  const { email, password } = req.body
  if (!email) {
    req.session.message = { error_msg_field_email:"l'email est requis", email: email || "", password: password || "" }
    return res.redirect('login')


  }
  if (!password) {
    req.session.message = { error_msg_field_password: "le passsword est requis", password: password, email: email || "" }
    return res.redirect('login')
  }
  User.findOne({ email }).then(user => {
    if (!user) {
      req.session.message = { email_notExist: "cet utilisateur n'existe pas veuiller creer un compte", password: password || "", email: email || "" }
      return res.redirect('login')
    }
    bcript.compare(password, user.password, (err, isvalid) => {
      if (isvalid) {
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '5h' })
        res.cookie('token', token, { httpOnly: true, maxAge: 21600000 })
        res.redirect('/')
        console.log("token injecter avec succes");
      }
      else {
        req.session.message = { incorrect_password: "mot de passe incorrect", password: password || "", email: email || "" }
        res.redirect('login')
      }
    })
  })
}

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token
  console.log(token);
  if (!token) {

    return next()
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      return res.redirect("/error?error=token invalide ou expirer veuiller vous reconnecter")
    }
    req.user = data
    return next()


  })
}

exports.sendMailContain = (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_NODE,
      pass: process.env.PASSWORD
    }
  })
  const mail_options = {
    from: process.env.EMAIL_NODE,
    to: options.email,
    subject: options.subject,
    html: options.message
  }
  return transporter.sendMail(mail_options)

}

exports.EmailVerified = async (req, res, next) => {
  req.session.message={}
  const userAuth = req.user
  if (!userAuth) {
    return next()
  }

  try {
    const verifiedEmailVerified = await User.findById(req.user.id)
    if (verifiedEmailVerified.emailVerified !== true) {
      req.session.message={
        error:"vous devez verifié votre email address"
      }

      return res.redirect('/send-email-verified')
    }
    return next()
  }
  catch (err) {
    req.session.message={
      error:"une erreur est survenue"
    }
    return res.redirect("/error")

  }

}

exports.SendEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.redirect("/login")
    }

    const token = crypto.randomBytes(20).toString('hex')
    user.emailVerifiedToken = token
    user.emailVerifiedTokenExpire = Date.now() + 20000000
    await user.save()
    const url = `http://${req.headers.host}/verified-email?token=${token}`
    const options = {
      email: user.email,
      subject: "GL dev : Verification de votre adresse email",
      message: `<p>veuiller cliquer sur ce lien 👇🏼👇🏼 pour verifier votre addresse email \n ${url}</p>`
    }
    this.sendMailContain(options).then(result => {
      console.log(result);
      req.session.message={
        success:"email envoyé avec succes"
      }
      return res.redirect('/send-email-verified')

    }).catch(err => {
      console.log(err);
    })
  }
  catch (err) {
    req.session.message={
      error:"une erreur est survenue"
    }
    return res.redirect("/send-email-verified")
  }

}

exports.EmailIsVerified = async (req, res, next) => {
  const token = req.query.token
  console.log("token" + token)
  try {

    const user = await User.findOne({
      emailVerifiedToken: token,
      emailVerifiedTokenExpire: { $gt: Date.now() }
    })
    console.log("user" + user)
    if (!user) {
      return res.redirect('/send-email-verified')
    }

    user.emailVerified = true
    user.emailVerifiedToken = null
    user.emailVerifiedTokenExpire = null
    user.save().then(() => {
      res.redirect('/profile')
    })
      .catch((err) => {
        console.log(err);
      })
  }
  catch {
    console.log('une erreur est survenue');
  }
}

exports.forgetpassword = async (req, res) => {
  const email = req.body.email
  if (!email || !email.includes('@gmail')) {
    req.session.message={
      error:"veuillez entrez un addresse email valide"
    }
    return res.redirect('/forget-password')
  }
  try {
    await User.findOne({ email }).then(user => {
      if (!user) {
        req.session.message={
          error:"cette addresse email n'existe pas"
        }
        return res.redirect("/forget-password")
      }
      const token = crypto.randomBytes(20).toString('hex')
      user.resetPasswordtoken = token
      user.resetPasswordtokenExpire = Date.now() + 20000000
      user.save()
      const url = `http://${req.headers.host}/reset-password?token=${token}`
      const options = {
        email: email,
        subject: "Reunitialisation du mot de passe",
        message: `<p>cliquer sur ce lien pour reunitialiser votre mot de passe  <a href=${url}>clique ici</a>
 </p>`
      }
      this.sendMailContain(options).then(result => {
        console.log(result);
        req.session.message={
          success:"email envoyé avec succes"
        }
        return res.redirect('/forget-password')
      }).catch(err => {
        console.log(err);
      })

    }).catch(err => {
      console.log(err);
      req.session.message={
        error:"une erreur est survenue reessayez"
      }
      return res.redirect('/forget-password')
    })


  }
  catch (err) {
    req.session.message={
      error:"une erreur est survenue reesayez"
    }
    return res.redirect('/forget-password')
  }
}

exports.forget_Password_emailVerified = async (req, res, next) => {
  const token = req.query.token
  try {
    const user = await User.findOne({
      resetPasswordtoken: token,
      resetPasswordtokenExpire: { $gt: Date.now() }
    })
    if (!user) {
      req.session.message={
        error:"le lien de confirmation ou token a expiré  "
      }
      return res.redirect('/forget-password')
    }
    return next()

  }
  catch (err) {
    req.session.message={
      error:"une erreur est survenue ! veuillez reessayez"
    }
    return res.redirect('/forget-password')
  }
}

exports.resetPassword = async (req, res) => {
  const token = req.query.token
  try {
    const user = await User.findOne({
      resetPasswordtoken: token,
      resetPasswordtokenExpire: { $gt: Date.now() }
    })
    if (!user) {
      console.log('user' + user);
      req.session.message={
        error:"une erreur est survenue ! veuillez reessayez"
      }
      return res.redirect('/forget-password')
    }
    bcript.hash(req.body.password, 10, (err, pass_hasher) => {
      if (err) throw err
      user.password = pass_hasher
      user.resetPasswordtoken = null
      user.resetPasswordtokenExpire = null

      user.save().then(() => {
        return res.redirect('/login')
      })
        .catch(() => {
          req.session.message={
            error:"une erreur est survenue ! veuillez reessayez"
          }
          return res.redirect('/reset-password')
        })

    })


  }
  catch (err) {
    req.session.message={
      error:"veuillez actualisez la page et reessayez"
    }
    return res.redirect('/reset-password')
  }
}

const DeleteUser = async(imagetab)=>{
  if(imagetab){
    for(const img of imagetab){
      
      try{
        await cloudinary.uploader.destroy(img.thumbail)
      }
      catch(err){
        req.session.message = "une erreur s'est produite"
      }
    }
  }
}

exports.deleteUser = async (req, res) => {
  const session =  (await mongoose.startSession()).startTransaction()
  
  if(!req.user){
    return res.redirect('/login')
  } 
  
  try {
  const user = await User.findById(req.user.id)
      
      if(!user){
        return res.redirect('/profile')
      }

    const course = await Course.find({user:user.id})
    if(course){
        await DeleteUser(course)
    }
    await Course.deleteMany({user:user.id})

    if(user.profilePicture && user.profilePicture !=="/images/profile-picture.jpg"){
      const publicId = user.profilePicture.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(`maneSchool/${publicId}`)
    }
   await  User.findByIdAndDelete(req.user.id).then((result) => {

      res.clearCookie('token')
      console.log(result);

      return res.redirect('/login')

    }).catch((err) => {
      console.log(err);

      return res.redirect('/profile')
    })
      (await mongoose.startSession()).commitTransaction()
      (await mongoose.startSession()).endSession

  }
  catch (err) {
    return res.redirect('/profile')
  }

}


exports.IsAdmin = (req,res,next)=>{
  if(!req.user){
    return res.redirect('/login')
  }
  if(req.user.role !=='admin'){
    return res.redirect('/profile')
  }
  next()
}
