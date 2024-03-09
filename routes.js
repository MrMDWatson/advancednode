const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = function (app, myDataBase) {

  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });
  
  app.route("/login").post(passport.authenticate("local", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/profile");
  })

  app.route("/auth/github").get(passport.authenticate("local"));

  app.route("/auth/github/callback").get(passport.authenticate("local", { failureRedirect: "/" }), (req, res) => {
    res.redirect("./profile");
  })

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    res.render("profile", {
      username: req.user.username
    });
  })
  
  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.route('/register').post(async (req, res, next) => {
    console.log("Attempting to register");
    console.log(req.body);
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const user = await myDataBase.findOne({ username: req.body.username });
      if (user) {
        res.redirect("/")
      } else {
        const newUser = await myDataBase.insertOne({
          username: req.body.username,
          password: hash
        });
        if (!newUser) {
          res.redirect("/")
        } else {
          next(null, newUser);
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      console.log("Accessing user profile");
      res.redirect('/profile');
    }
  );
  
  app.use((req, res) => {
    res.status(404)
    .type('text')
    .send('Not Found');
  });
  
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };
}