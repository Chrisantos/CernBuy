const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let model = new Schema({
    handle:   String,
    password:   String
});

model.pre('save', (next) =>{
    next();
});

module.exports = mongoose.model('admin', model);