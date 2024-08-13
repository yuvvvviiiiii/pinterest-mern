var express = require('express');
var router = express.Router();
const passport = require('passport');
const userModel = require("./users")
const postModel = require('./post');
const upload  = require("./multer");

const LocalStrategy = require('passport-local').Strategy; // Ensure the correct capitalization
passport.use(new LocalStrategy(userModel.authenticate()));;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {error: req.flash('error')});
});

router.get('/login', function(req, res, next) {
  res.render('login', { error: req.flash('error')});
});

router.get('/feed',isLoggedIn, async function(req, res, next) {
  const user = await userModel
  .findOne({username: req.session.passport.user})
  const posts = await postModel.find()
  .populate('user')
  console.log(posts);
  res.render('feed', { user, posts });
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel
  .findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  res.render('profile', { user });
})

router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  const user = await userModel
  .findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  res.render('show', { user });
})

router.get('/feed/post', isLoggedIn, async function(req, res, next) {
  const user = await userModel
  .findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  res.render('post', { user });
})

router.get('/add', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render('add', { user });
})

router.post('/createpin', isLoggedIn, upload.single("postimage"), async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});


router.get('/register', function(req, res) {
  res.render('register')
})

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.displayPicture = req.file.filename;
  await user.save();
  res.redirect("/profile");
})

router.post('/register', function(req, res) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname
  })

  userModel.register(userData, req.body.password)
  .then(function() {
    passport.authenticate('local')(req, res, function(){
      res.redirect("/profile");
    })
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}), function(req, res){

});

router.get('/logout', function(req, res) {
  req.logOut(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
