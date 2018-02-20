var express           = require('express');
var multer            = require('multer');
var upload            = multer({ dest: 'uploads/' });
var passport          = require('passport');
var LocalStrategy     = require('passport-local').Strategy;
var User              = require('../models/user');


var router  = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users',{title : 'Users'})
});

router.get('/register', function(req, res, next) {
    res.render('register',{title : 'Register'})
});

router.get('/login', function(req, res, next) {
    res.render('login',{title : 'Login'})
});

router.get('/logout', function(req, res, next) {
    req.logout();
    req.flash('success','You logged out');
    res.redirect('/users/login');
})
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserByID(id, function(err, user) {
        done(err, user);
    });
});
passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log(username);
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                console.log('Unknown User');
                return done(null, false, { message: 'Incorrect username.' });
            }
            User.comparePassword(password,user.password,function (err,isMatch) {
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                }else{
                    console.log('Invalid password');
                    return done(null,false,{message:"Invalid password"});
                }
            })
        });
    }
));

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password'
}),function (req,res) {
    req.flash('succress','You are logged in');
    res.redirect('/');
});
router.post('/register', upload.single('profileimage'), function(req,res,next){
    let name        = req.body.name;
    let email       = req.body.email;
    let username    = req.body.username;
    let password    = req.body.password;
    let password2   = req.body.password2;

    if(req.file){
        console.log('uploading file');
        var profileImageOriginalName    = req.files.profileimage.originalname;
        var profileImageName            = req.files.profileimage.name;
        var profileImageMime            = req.files.profileimage.mimetype;
        var profileImagePath            = req.files.profileimage.path;
        var profileImageExt             = req.files.profileimage.extension;
        var profileImageSize            = req.files.profileimage.size;
    }else{
        var profileImageName = 'noimage.png'
    }

    req.checkBody('name',       'Name field is required').notEmpty();
    req.checkBody('email',      'Email field is required').notEmpty();
    req.checkBody('email',      'Email isnt valid').isEmail();
    req.checkBody('username',   'Username field is empty').notEmpty();
    req.checkBody('password',   'Password field is empty').notEmpty();
    req.checkBody('password2',  'Password dont match').equals(req.body.password);
    let errors = req.validationErrors();
    if(errors){
        console.log(errors);
        res.render('register',{
            errors      : errors,
            name        : name,
            email       : email,
            username    : username,
            password    : password,
            password2   : password2,
            title       : 'Register'
        });
    }else{

        let newUser= new User({
            name        : name,
            email       : email,
            username    : username,
            password    : password,
            password2   : password2,
            ProfileImage: profileImageName
        });
        // Create User
        User.createUser(newUser,(err,user) =>{
            if(err) throw err;
        });
        //Success Message
        req.flash('success','You are registered successfully');

        res.location('/');
        res.redirect('/');

    }


});
module.exports = router;
