const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapasync=require("/Users/sumanareddy/Desktop/maj project/init/utils/wrapasync.js");
const {  reviewschema } = require('../schema.js')
const Expresserror=require("/Users/sumanareddy/Desktop/maj project/init/utils/expresserror.js");
const { isloggedin } = require("../middleware.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const { validatereview } = require("../middleware.js");


  //reviews post
  router.post("/",isloggedin,validatereview, wrapasync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    let newreview = new Review(req.body.review);
    newreview.author = req.user._id;
    listing.reviews.push(newreview);
    newreview.save();
    await listing.save();
    req.flash("success","Successfully created a new review");
    res.redirect(`/listings/${id}`);
  }
  ));

  //delete reviews
  router.delete("/:reviewid",isloggedin,wrapasync( async (req, res) => {
    let { id, reviewid } = req.params;
    const review = await Review.findById(reviewid);
    if (!review.author.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that");
      return res.redirect(`/listings/${id}`);
    }
    await Review.findByIdAndDelete(reviewid);
    Listing.reviews.pull(reviewid);
    await Listing.save();
    req.flash("success","Successfully deleted a review");
    res.redirect(`/listings/${id}`);
  }));
  module.exports = router;