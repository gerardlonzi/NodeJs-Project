const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const path = require("path")
const router = require("./routes/auth")
const routerAouth = require('./routes/AuthOuthroad')
const passport = require("./controllers/AuthOuth")
const session = require("express-session")
const cookie_parser = require("cookie-parser")
const method_overide = require('method-override')
const routerDashboard = require('./routes/DashboardActionRoad')
const profileRouter = require("./routes/uploadData")
const cmemory_cache = require("memory-cache")
const compression = require("compression")
const sharp = require("sharp")
const app = express()
app.use(cookie_parser())

dotenv.config()

mongoose.connect(process.env.MONGODB_URL).then(() => {
      console.log(`connecter a la base de donnees`);
      app.listen(process.env.PORT, () => {
            console.log(`server connecter au port ${process.env.PORT} ou 8000`);
      })

})
      .catch(err => {
            console.log("erreur lors de la connexion a .\la base de donnees");
            return
      })

function cacheMiddleware(duration) {
            return (req, res, next) => {
                const key = '__express__' + req.originalUrl || req.url;
                const cachedBody = cache.get(key);
        
                if (cachedBody) {
                    return res.send(cachedBody);
                } else {
                    res.sendResponse = res.send;
                    res.send = (body) => {
                        cache.put(key, body, duration * 1000); 
                        res.sendResponse(body);
                    };
                    next();
                }
            };
        }
        
app.get('/data', cacheMiddleware(10), (req, res) => {
            res.send("Contenu mis en cache pendant 10 secondes !");
});

app.use(compression());
app.use(express.static(path.join(__dirname, "public")))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

app.use(session({
      secret: process.env.EXPRESS_SECRET,
      resave: true,
      saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(method_overide('_method'))

app.use(profileRouter)
app.use(router)
app.use('/auth',routerAouth)
app.use('/dashboard',routerDashboard)

