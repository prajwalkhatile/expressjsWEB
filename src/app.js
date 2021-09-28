require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");

require("./db/connect");
const Register = require("./models/registration");
const port = process.env.PORT || 8000;

const staticpath = path.join(__dirname, "../public");
console.log(path.join(__dirname, "../views"));
const temppath = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", temppath);
app.use(express.static(staticpath));
hbs.registerPartials(partial_path);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get("", (req, res) => {
  res.render("index");
});
app.get("/secret", auth, (req, res) => {
  console.log(`And the cookie we get is ${req.cookies.jwt}`);
  res.render("secret");
  // res.render("register");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const confPassword = req.body.confirm_password;

    if (password === confPassword) {
      const registerCandiate = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age,
        password: req.body.password,
        confirm_password: req.body.confirm_password,
        gender: req.body.gender,

        email: req.body.email,
        phone: req.body.phone,
      });

      // the following part is used to generate the jwt token
      console.log(`the success part is ${registerCandiate}`);
      const token = await registerCandiate.generateAuthToken();
      console.log(`the token part is ${token}`);

      // the following part is to store the cookie of our site
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 100000),
        httpOnly: true,
      });
      console.log(`the cookies we are geeting is ${cookie}`);

      // befor calling the save function we use middleware for hashing our password which is defined at registration.js page

      const registered = await registerCandiate.save();
      res.status(201).render("index");
    } else {
      res.send("Password does not match");
    }
  } catch (error) {
    res.status(400).send(error);
    console.log("Error while rendering ");
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userEmail = await Register.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, userEmail.password);

    const token = await userEmail.generateAuthToken();
    console.log(`the success part is ${token}`);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 100000),
      httpOnly: true,
    });
    // console.log(`the cookie we get while login time is ${req.cookies.jwt}`);

    if (isMatch) {
      res.status(201).render("index");
      // const token2 = await registerCandiate.generateAuthToken();
      // console.log(`the login token is successfully generated ${token2}`);
    } else {
      res.send("Invalid login credintials1");
    }
  } catch (error) {
    res.status(400).send("Invalid login credintials");
  }
});
app.get("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("jwt");
    console.log("You have been successfully logout....");

    // this is how we can log out user from all the device and deleting the token form the database
    req.user.tokens = [];

    await req.user.save();
    res.redirect("/login");
  } catch (error) {
    res.status(500).send(error);
    console.log("Error while rendering your login page");
  }
});

app.listen(port, () => {
  console.log(`I'm listing the server at port no ${port}`);
});
