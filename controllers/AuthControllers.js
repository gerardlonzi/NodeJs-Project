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
    return res.redirect('/register')


  }

  if (password.length < 8) {
    req.session.message = { password_length: "le mot de paase doit comporter au moins 8 caractéres", password: password, email: email || "" }
    errors.push({ msg: "le mot de passe doit comporter au moins 8 caractéres" })

    return res.redirect('/register')

  }
  if (errors.length > 0) {
    req.session.message = { eror_spec: "une erreur s'est produite" }
    return res.redirect('/register')

  }
  else {
    User.findOne({ email }).then(user => {
      if (user) {
        req.session.message = { email_exist: " Désoler cette adresse email existe deja", email: email || "", password: password || "" }
        res.redirect("/register")
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

            newUser.save().then(user => {
              const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '5h' })
              res.cookie('token', token, { httpOnly: true, maxAge: 21600000 })
              res.redirect('/send-email-verified')
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
    return res.redirect('/login')


  }
  if (!password) {
    req.session.message = { error_msg_field_password: "le passsword est requis", password: password, email: email || "" }
    return res.redirect('/login')
  }
  User.findOne({ email }).then(user => {
    if (!user) {
      req.session.message = { email_notExist: "cet utilisateur n'existe pas veuiller créer un compte", password: password || "", email: email || "" }
      return res.redirect('/login')
    }
    bcript.compare(password, user.password, (err, isvalid) => {
      if (isvalid) {
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '5h' })
        res.cookie('token', token, { httpOnly: true, maxAge: 21600000 })
        res.redirect('/')
      }
      else {
        req.session.message = { incorrect_password: "mot de passe incorrect", password: password || "", email: email || "" }
        res.redirect('/login')
      }
    })
  })
}

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token
  if (!token) {

    return next()
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      return res.redirect("/login")
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
 const date = new Date().getFullYear()
    const token = crypto.randomBytes(20).toString('hex')
    user.emailVerifiedToken = token
    user.emailVerifiedTokenExpire = Date.now() + 20000000
    await user.save()
    const url = `http://${req.headers.host}/verified-email?token=${token}`
    const options = {
      email: user.email,
      subject: "Maneliza E-learning : Vérification de votre adresse email",
      message: `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <div style="text-align: center; padding-bottom: 20px;">
      <img src="https://res.cloudinary.com/dl61aaiee/image/upload/v1727815982/maneliza-removebg-preview_xlig0u.png" alt="Logo" style="width: 120px; margin-bottom: 20px;">
      <h2 style="color: #0f2445; font-size: 24px;">Vérifiez votre adresse e-mail</h2>
    </div>
    <p style="color: #555; font-size: 16px; line-height: 1.5;">
      Merci de vous être inscrit(e) sur notre plateforme. Afin de compléter votre inscription, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href=${url} 
         style="background-color: #208052; color: white; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px; display: inline-block;">
         Vérifier mon e-mail
      </a>
    </div>
    <p style="color: #999; font-size: 14px; line-height: 1.5;">
      Si vous n'avez pas créé de compte, veuillez ignorer cet email. Ce lien expirera dans 4 heures.
    </p>
    <div style="border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center;">
      <p style="color: #999; font-size: 12px;">
        © ${date} VotreSite. Tous droits réservés. | <a href="https://votre-site.com" style="color: #208052; text-decoration: none;">votre-site.com</a>
      </p>
    </div>
  </div>
      `
      

    }
    this.sendMailContain(options).then(result => {
      console.log(result);
      req.session.message={
        success:"email envoyé avec succes"
      }
      return res.redirect('/send-email-verified')

    }).catch(err => {
      return res.redirect("/send-email-verified")
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
  try {

    const user = await User.findOne({
      emailVerifiedToken: token,
      emailVerifiedTokenExpire: { $gt: Date.now() }
    })
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
        return res.redirect('/send-email-verified')
    })
  }
  catch {
    req.session.message={
      error:"une erreur est survenue"
    } 
    return res.redirect('/send-email-verified')
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
        subject: "Reinitialisation du mot de passe",
        message: `<p>cliquer sur ce lien pour reunitialiser votre mot de passe  <a href=${url}>clique ici</a>
 </p>`
      }
      this.sendMailContain(options).then(result => {
        req.session.message={
          success:"email envoyé avec succes"
        }
        return res.redirect('/forget-password')
      }).catch(err => {
        req.session.message={
          error:"une erreur c'est produit"
        }
        return res.redirect('/forget-password')
      })

    }).catch(err => {
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


exports.deleteUser = async (req, res) => {
   const session = await mongoose.startSession()
   session.startTransaction()
  
  if(!req.user){
    return res.redirect('/login')
  } 
  
  try {
  const user = await User.findById(req.user.id)
      
      if(!user){
        session.abortTransaction()
        session.endSession()
        return res.redirect('/profile')
      }

    const course = await Course.find({user:user.id})
    if(course){
      for(const el of course){
      
        try{
          await cloudinary.uploader.destroy(`maneSchool/${el.thumbail.split('/').pop().split('.')[0]}`)
        }
        catch(err){
          req.session.message = "une erreur s'est produite"
          session.abortTransaction()
        session.endSession()
          return res.redirect('/profile')
        }
      }
    }
    await Course.deleteMany({user:user.id})

    if(user.profilePicture && user.profilePicture !=="/images/profile-picture.jpg"){
      const publicId = user.profilePicture.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(`maneSchool/${publicId}`)
    }
   await  User.findByIdAndDelete(req.user.id)
      res.clearCookie('token')
      session.abortTransaction()
      session.endSession()
      return res.redirect('/login')


  }
  catch (err) {
    session.abortTransaction()
    session.endSession()
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
