//require the modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs =require('ejs');
const mongoose =require('mongoose');
const encrypt = require('mongoose-encryption');


// create app
const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static('public'));
mongoose.connect("mongodb://127.0.0.1:27017/userDB");


// create the database and schema
const userSchema = new mongoose.Schema({
    email:String,
    password:String,
});


// encryting the data
userSchema.plugin(encrypt,{secret:process.env.secret,encryptedFields:["password"]});

// creating the model
const User = mongoose.model("User",userSchema);


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

app.post('/register',(req,res)=>{
    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    })
    newUser.save();
    res.render('secrets.ejs');
})
app.post('/login',async(req,res)=>{
    try {
    const founduser =  await User.findOne({email:req.body.username})
       if(founduser)
              {
                if(founduser.password === req.body.password)
                {res.render('secrets');}
              
              else{
                res.redirect('/login');
              }}
     else{
            res.redirect('/login');
          }          
     }
    catch(err){
        console.log(err)
    }
})

app.listen(3000,()=>{
    console.log("server running at port 3000");
})