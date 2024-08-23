const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require("path")
const router = require("./routes/auth")
const passport = require("passport")
const session = require("express-session")


const app = express()

dotenv.config()

mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser:true,useUnifiedTopology:true}).then(() => {
      console.log(`connecter a la base de donnees`);
})
      .catch(err => {
            console.log("erreur lors de la connexion ala base de donnees");
            return
      })

app.use(express.static(path.join(__dirname, "public")))
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))

app.use(session({
     secret:process.env.EXPRESS_SECRET ,
     resave:true,
     saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(router)

app.listen(process.env.PORT, () => {
      console.log(`server connecter au port ${process.env.PORT} ou 8000`);
})
