const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let model = new Schema({
    handle:     String,
    password:   String,
    cart_item:  Number
});

model.pre('save', (next) =>{
    next();
});

module.exports = mongoose.model('users', model);