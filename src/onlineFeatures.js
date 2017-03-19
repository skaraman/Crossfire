var Clock = require('famous/core/Clock');

function OnlineFeatures (storage){
  this.isConnected = false;
  this.storage = storage;
}

OnlineFeatures.prototype.login = function login() {
  try {
    Cocoon
  } catch (e) {
    if(!Cocoon) throw new Error("No Cocoon!")
  }
  if(Cocoon.getPlatform() == 'ios') {
    window.social = Cocoon.Social.GameCenter.init();
    window.social = Cocoon.Social.GameCenter.getSocialInterface();
    this.loggedIn = window.social.isLoggedIn();
    if (!window.social.isLoggedIn()) {
      window.social.login();
    }
  }
}

OnlineFeatures.prototype.leaderboard = function() {
  if (window.social){
    window.social.on("loginStatusChanged", function(loggedIn, error) {
      if (this.loggedIn) {
        window.social.requestScore(function(score, error) {
          if (error) {
            console.error("Error getting user score: " + error.message);
          }else if (score) {
            console.log("score: " + score.score);
            window.localUserScore = score.score;
            if(game.storage) window.localStorage.high_score = score.score
          }
        },{
          leaderboardID: "com.karaman.crossfire.highScore"
        });
      }
    });
  }
  this.login();
}

OnlineFeatures.prototype.ads = function() {
  if (typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'){
    if(Cocoon.Ad.AdMob && game.interstitial){
      game.interstitial.show();
    }
  }
}
OnlineFeatures.prototype.submitScore = function() {
  if (typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'
  && window.social && window.social.isLoggedIn()) {
    socialScore = window.localStorage.high_score;
    if((window.localUserScore && window.localUserScore < window.localStorage.high_score)
    || !window.localUserScore){
      window.social.submitScore(socialScore, function(error){
        if (error) console.error("submitScore error: " + error.message);
      },{
        leaderboardID: "com.karaman.crossfire.highScore"
      });
    }
  }
}





if(typeof(Cocoon) != 'undefined' && Cocoon.getPlatform() == 'ios'
&& Cocoon.Ad.AdMob){
    Cocoon.Ad.AdMob.configure({
        ios: {
            banner:"ca-app-pub-4693632452063283/2829774253",
            interstitial:"ca-app-pub-4693632452063283/4023645854"
        }
    });
    loadAndShowBannerAd();
    loadInterstitialAd();
}

module.exports = OnlineFeatures;
