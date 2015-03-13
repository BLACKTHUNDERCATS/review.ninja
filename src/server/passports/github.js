'use strict';
var github = require('../services/github');
var onboard = require('../services/onboard');
var url = require('../services/url');
var passport = require('passport');
var Strategy = require('passport-github').Strategy;
var merge = require('merge');
var sugar = require('array-sugar');

passport.use(new Strategy({
        clientID: config.server.github.client,
        clientSecret: config.server.github.secret,
        callbackURL: url.githubCallback,
        authorizationURL: url.githubAuthorization,
        tokenURL: url.githubToken,
        userProfileURL: url.githubProfile()
    },
    function(accessToken, refreshToken, profile, done) {
        models.User.update({
            uuid: profile.id
        }, {
            name: profile.username,
            token: accessToken
        }, {
            upsert: true
        }, function(err, num, res) {
            if (!!res.upserted) {
                var uuid = onboard.getUser(res);
                console.log('user id: ', uuid);
                console.log('profile: ', profile);
                onboard.addUserAsCollaborator(profile.username, accessToken);
                console.log('omg it worked')
            }
            done(null, merge(profile._json, {
                token: accessToken
            }));
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});
