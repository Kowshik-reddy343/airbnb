const Expresserror=require("./utils/Expresserror.js");
const { listingschema, reviewschema } = require("./schema.js");


module.exports.isloggedin = (req, res, next)=> {
  // Middleware function to check if user is authenticated
  if (!req.isAuthenticated()) {
    req.session.redirectTo = req.originalUrl; // Store the original URL
    req.flash("error", "You must be signed in first");
    return res.redirect("/login");
  }
  // If authenticated, proceed to the next middleware or route handler
  next();
}

module.exports.saveurl = (req, res, next) => {
  // Middleware function to save the original URL
  if ( req.session.redirectTo) {
    res.locals.url = req.originalUrl; // Store the original URL
  }
  // Proceed to the next middleware or route handler
  next();
}

module.exports.validatelisting=  (req,res,next)=>{
    console.log("Incoming req.body:", req.body);
    let {error} = listingschema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new Expresserror(400, errMsg);
    }
    else {
        next();
    }
}

module.exports.validatereview=  (req,res,next)=>{
  const { error } = reviewschema.validate(req.body.listing);
  if (error) {
      console.log(error);
      return res.status(400).send(error.details[0].message);
    }
  next();
  
}