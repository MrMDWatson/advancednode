require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require("bcrypt");
const { ObjectID } = require('mongodb');

module.exports = function (app, myDataBase) {

  passport.serializeUser((user, done) => {
    console.log("Serialized user " + user);
    done(null, user._id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await myDataBase.findOne({ _id: id });
      if (!user) {
        console.log("Could not deserialize ");
      }
      done(null, user);
    } catch(err) {
      console.log(err);
    }
    
  });


  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      console.log(`User ${username} attempted to log in.`);
      const user = await myDataBase.findOne({ username: username });
      if (!user) {return done(null, false);}  
      const passed = await bcrypt.compareSync(password, user.password);
      if (!passed) { 
        console.log("Incorrect password entered");
        return done(null, false);
      }
      console.log("Local auth successful");
      return done(null, user);
    } catch (err) {
      console.log(err);
    }
  }));

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://65de46dd-a675-40bf-a2e7-32b6b1a45b51-00-2nj2sx8sa840j.janeway.replit.dev/auth/github/callback"
  },
    async (accessToken, refreshToken, profile, cb) => {
      console.log(profile);
      //Database logic here with callback containing your user object
      try {
        console.log(`User ${profile.username} attempted to log in.`);
        const user = await myDataBase.findOneAndUpdate(
          { id: profile.id },
          {
            $setOnInsert: {
              id: profile.id,
              username: profile.username,
              name: profile.displayName || 'John Doe',
              photo: profile.photos[0].value || '',
              email: Array.isArray(profile.emails)
                ? profile.emails[0].value
                : 'No public email',
              created_on: new Date(),
              provider: profile.provider || ''
            },
            $set: {
              last_login: new Date()
            },
            $inc: {
              login_count: 1
            }
          },
          { upsert: true, new: true, returnDocument: "after" });
        if (!user) {
          console.log("Error updating mongodb")
          return cb(null, false);
        }
        console.log("Git auth successful")
        return cb(null, user);
      } catch (err) {
        console.log(err);
      }

    }
  ));
}