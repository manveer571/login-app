//require the modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs =require('ejs');
const mongoose =require('mongoose');
const session = require("express-session");
const passport = require('passport');
const passportLocalMongoose  = require('passport-local-mongoose');
// hash module
const md5  = require('md5');
// const encrypt = require('mongoose-encryption');


// create app
const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(session({
    secret:"Our little secret",
    resave:false,
    saveUninitialized:false,
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1:27017/userDB");


// create the database and schema
const userSchema = new mongoose.Schema({
    email:String,
    password:String,
});

userSchema.plugin(passportLocalMongoose);
// encryting the data
// userSchema.plugin(encrypt,{secret:process.env.secret,encryptedFields:["password"]});

// creating the model 
const User = mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// setting up all the requests
app.get("/",(req,res)=>{
    res.render('home.ejs');
})

app.get('/register',(req,res)=>{
 res.render("register");
})
app.get('/login',(req,res)=>{
 res.render("login");
})
app.get("/secrets",(req,res)=>{
  if(req.isAuthenticated())
  {
    res.render("secrets");
  }
  else
  res.redirect("/login"); 
});
app.get('/logout',(req,res)=>{
    req.logout(function(err){
        if(err)
        {console.log(err);}
    });
    res.redirect('/');
})
app.post('/register',(req,res)=>{
    User.register({username:req.body.username},req.body.password,function(err,user){
    if(err)
    {
        console.log(err);
        res.redirect('/register');}
    else
    {
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        });
    }
   })
})
app.post('/login',async(req,res)=>{
   const user = new User({
    username:req.body.username,
    password:req.body.password
   });
 req.login(user,function(err){
    if(err)
    {console.log(err);}
    else{
        passport.authenticate("local")(req,res,function(){
            res.redirect('/secrets');
        })
    }
 })
})

app.listen(3000,()=>{
    console.log("server running at port 3000");
})