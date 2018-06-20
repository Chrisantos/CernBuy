const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let model = new Schema({
    tag:            String,
    title:          String,
    description:    String,
    price:          String,
    quantity:       String,
    image_url:      String,
    image_id:       String,
    width:          String,
    height:         String,
    created_at:     Date
});

model.pre('save', (next) =>{
    next();
});

module.exports = mongoose.model('posts', model);