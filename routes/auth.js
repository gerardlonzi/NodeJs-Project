const express = require("express")
const { register } = require("../controllers/AuthControllers")
const router = express.Router()

router.post("/register",register)

router.get("/", (req, res) => {
    res.render("../views/home")
})
router.get("/login", (req, res) => {
    res.render("../views/login",{pageTitle:"Login"})
})
router.get("/register", (req, res) => {
    res.render("../views/register",{pageTitle:"Register"})
})

module.exports = router