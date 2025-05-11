const Joi = require('joi');
const review = require('./models/review');
const listingschema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        image:Joi.string().required(),
        price : Joi.number().required().min(0),
        location:Joi.string(),
        country:Joi.string().required()
    }).required(),
});
const reviewschema=Joi.object({
    review :Joi.object({
        body:Joi.string().required(),
        rating:Joi.number().min(1).max(5).required()
    }).required(),
});
module.exports={listingschema,reviewschema}
// const { listingschema, reviewschema } = require('./schema.js')