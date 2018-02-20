var mongoose    = require('mongoose');
var bcrypt      = require('bcrypt');
mongoose.connect('mongodb://localhost/users');
var db          = mongoose.connection;

//User Schema
var userSchema = mongoose.Schema({
    name        : {
        type    : String,
        index   : true
    },
    email       : {
        type    : String
    },
    username    : {
        type    : String
    },
    password    : {
        type    : String,
        required: true,
        bcrypt  : true
    },
    ProfileImage: {
        type    : String
    }
});
var User = module.exports = mongoose.model('User', userSchema);

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword,hash,function(err,isMatch){
        if(err) return callback(err);
        callback(null,isMatch);

    });
}
module.exports.getUserByID = function (id,callback) {
    User.findById(id,callback);
}
module.exports.getUserByUsername = function (username,callback) {
    User.findOne({ username: username },callback);
}

module.exports.createUser = function (newUser, callback) {
    /*
    const saltRounds = 10;
    const myPlaintextPassword = newUser.password;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
            newUser.password= hash;
        });
    });
    */
    bcrypt.hash(newUser.password,10,(err,hash) => {
       if(err) throw err;
       newUser.password= hash;
       newUser.save(callback);
    });

}