require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require("bcrypt");
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, myDataBase) {

  passport.serializeUser((user, done) => {
    console.log("Serialized")
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
        if (err) return console.error(err);
        console.log("Deserialized");
        done(null, doc);
    });
  });


  passport.use(new LocalStrategy(
    (username, password, done) => {
    myDataBase.findOne({ username: username }, (err, user) => {
      console.log(`User ${username} attempted to log in.`);
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!bcrypt.compareSync(password, user.password)) { 
        return done(null, false);
      }
      return done(null, user);
    });
  }));
  /*
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://65de46dd-a675-40bf-a2e7-32b6b1a45b51-00-2nj2sx8sa840j.janeway.replit.dev/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      myDataBase.findAndModify(
        { id: profile.id },
        {},
        {
          $setOnInsert: {
            id: profile.id,
            name: profile.displayName || 'John Doe',
            photo: profile.photos[0].value || '',
            email: Array.isArray(profile.emails) ? profile.emails[0].value : 'No public email',
            created_on: new Date(),
            provider: profile.provider || ''
          }, $set: {
            last_login: new Date()
          }, $inc: {
            login_count: 1
          }
        },
        { upsert: true, new: true },
        (err, doc) => {
          return cb(null, doc.value);
        }
      );
    }
  ));
  */
}