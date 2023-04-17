const mongoose = require('mongoose');

const users = new mongoose.Schema({
    access_token: { type: String },
    refresh_token: { type: String }
});

const userSchema = new mongoose.Schema({
    idU: { type: String },
    access_token: { type: String },
    refresh_token: { type: String },
    time: { type: String }
});

// module.exports.users = mongoose.model('users', users);

module.exports.Users = mongoose.model('users', userSchema);