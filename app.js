const express = require('express');
const app=express();
const mongoose=require("mongoose");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dburl='mongodb+srv://venkatakowshikreddy648:j0BhA3w7HRiyPaiP@cluster0.3yc0xsg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const session=require("express-session");
const  MongoStore  = require('connect-mongo');
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");
const wrapasync=require("./utils/wrapasync.js");
const Expresserror=require("./utils/Expresserror.js");
const listings=require("./routes/listings.js");
const reviews=require("./routes/reviews.js");
const flash=require("connect-flash");
const { saveurl } = require('./middleware.js');
const Listing = require('./models/listing.js');




main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}

app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
  mongoUrl: dburl,
  crypto:{secret:"mysupersecretcode"},
  touchAfter: 24 * 60 * 60,
  ttl: 7 * 24 * 60 * 60 // = 7 days. Default
});
store.on("error", function(e) {
  console.log("session store error", e);
}
);

const sessionOptions={
     store: store,
     secret:"mysupersecretcode",
     resave:false,
     saveUninitialized:true,
     cookie: {
         httpOnly: true,
         expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
         maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
     }
    };

    app.get("/", async (req, res) => {
      res.send("home page");
    });


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success"); 
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();
}
);
app.use("/listings", listings);
app.use("/listings/:id/reviews",reviews);


app.get("/demouser",wrapasync(async (req, res) => {
      let fakeuser=new User({
        email:"student@gmail.com",
        username:"student",
      })
      let registereduser=await User.register(fakeuser,"helloworld");
          res.send(registereduser);
      }));

  app.get("/signup", (req, res) => {
    res.render("user/signup.ejs");
    
  });

  app.post("/signup", wrapasync(async (req, res) => {
    
    let { email, username, password } = req.body;
    let newuser = new User({ email, username });
    const registereduser=await User.register(newuser, password);
    console.log(registereduser);
    req.login(registereduser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
    
  }))

  app.get("/login", (req, res) => {
    res.render("user/login.ejs");
  }
  );
  app.post("/login",saveurl,passport.authenticate("local", { failureRedirect: "/login" }), 
   async(req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.url || "/listings");
  });

  app.get("/logout", (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success", "Goodbye!");
      res.redirect('/listings');
    });
  })
app.all("*",(req,res,next)=>{
    next(new Expresserror("page not found",404));
}
);

app.use((err,req,res,next)=>{
    console.log(err);
    let {message,statusCode}=err;
    res.render("error.ejs",{message});
    
}
);

app.listen(8080,()=>{
    console.log("server busy 8080");
});