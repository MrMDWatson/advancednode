const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const { ObjectID } = require('mongodb');

module.exports = function (app, myDataBase) {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    const user = myDataBase.findOne({ _id: id });
    if (!user) {
      return console.error(err);
    } else {
      done(null, user);
    }
  });

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      console.log(`User ${username} attempted to log in.`);
      const user = await myDataBase.findOne({ username: username });
      if (!user) {return done(null, false);}  
      const passed = await bcrypt.compareSync(password, user.password);
        if (!passed) { 
          return done(null, false);
        }
        return done(null, user);
    } catch (err) {
      console.log(err);
    }
  }));
}