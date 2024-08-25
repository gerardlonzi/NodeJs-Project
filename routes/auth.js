const express = require("express")
const { register, login, verifyToken } = require("../controllers/AuthControllers")
const router = express.Router()

router.post("/api/auth/register",register)
router.post("/api/auth/login",login,(req,res)=>{
    
})
router.get("/", (req, res) => {
    res.render("../views/home")
})
router.get('/dashboard',verifyToken,(req,res)=>{
  res.render("../views/dashboard")
})
router.get("/login", (req, res) => {
    res.render("../views/login",{pageTitle:"Login"})
})
router.get("/register", (req, res) => {
    res.render("../views/register",{pageTitle:"Register"})
})

module.exports = router