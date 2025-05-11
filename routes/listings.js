const express = require('express');
const router = express.Router();
const wrapasync=require("/Users/sumanareddy/Desktop/maj project/init/utils/wrapasync.js");
const { listingschema, reviewschema } = require('../schema.js')
const Expresserror=require("/Users/sumanareddy/Desktop/maj project/init/utils/expresserror.js");
const Listing=require("../models/listing.js");
const { isloggedin } = require("../middleware.js");
const { validatelisting } = require("../middleware.js");
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');


 
//Index Route
router.get("/", wrapasync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));


//search route
router.get("/search", wrapasync(async (req, res) => {
  const  search  = req.query.searchtext;
  console.log(search);
  const allListings = await Listing.find({});
  console.log(allListings);
  
  for (let i = 0; i < allListings.length; i++) {
    if (allListings[i].title.toLowerCase() === search.toLowerCase()) {
      console.log(allListings[i]);
      const id = allListings[i]._id;
      console.log(id);
      res.redirect(`/listings/${id}`); 
      return;
    }
  }
}
));

//New Route
router.get("/new",isloggedin, (req, res) => {
    res.render("listings/new.ejs");
  });

 //show route 
  router.get("/:id",wrapasync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews", populate:{path:"author"}})
    .populate("owner");
    if (!listing) {
      req.flash("error", "Cannot find that listing");
      return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  }));

//Create Route
router.post("/",validatelisting,wrapasync (async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","Successfully created a new listing");
    res.redirect("/listings");
  }));

  //Edit Route
router.get("/:id/edit",isloggedin, wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Cannot find that listing");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  }));

  //update route
  router.put("/:id",isloggedin, validatelisting, wrapasync(async (req, res) => {
    
    let { id } = req.params;
    let listing= await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that");
      return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));

  //Delete Route
router.delete("/:id",isloggedin,wrapasync( async (req, res) => {
    let { id } = req.params;
    let listing= await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that");
      return res.redirect(`/listings/${id}`);
    }
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Successfully deleted the listing");
    res.redirect("/listings");
  }));
  module.exports = router;