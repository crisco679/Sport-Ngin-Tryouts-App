var app = angular.module('tryoutsApp', ['ngRoute', 'mobile-angular-ui', 'mobile-angular-ui.gestures', 'pickadate']);

//////////////////////////////////////////////////////////////////////////////////
//  Config
//////////////////////////////////////////////////////////////////////////////////
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/app/view/',
      controller: 'LoginController',
      controllerAs: 'login',
    })
    .when('/logout', {
      templateUrl: '/app/view/',
      controller: 'LogoutController',
      controllerAs: 'logout'
    })
    .when('/archives', {
      templateUrl: '/app/view/archives',
      controller: 'ArchivesController',
      controllerAs: 'archive'
    })
    .when('/new', {
      templateUrl: '/app/view/new',
      controller: 'TryoutInputController',
      controllerAs: 'input'
    })
    .when('/edit/:id', {
      templateUrl: '/app/view/edit/',
      controller: 'EditController',
      controllerAs: 'edit'
    })
    .when('/players/:id', {
      templateUrl: '/app/view/players',
      controller: 'PlayerNumberController',
      controllerAs: 'num'
    })
    .when('/tryout/:id', {
      templateUrl: '/app/view/tryout',
      controller: 'TryoutReviewController',
      controllerAs: 'review'
    })
    .when('/doTheThing/:id', {
      templateUrl: '/app/view/doTheThing',
      controller: 'AssignScoreController',
      controllerAs: 'assign'
    })
  $locationProvider.html5Mode(true);
}]);  //  app.config

//////////////////////////////////////////////////////////////////////////////////
//  Controllers
//////////////////////////////////////////////////////////////////////////////////
app.controller('AssignScoreController', function(){
  console.log('Hello World');
})

app.controller('TryoutReviewController', ['$routeParams', 'TryoutService', function($routeParams, TryoutService){
  var trc = this;
  trc.player = {};
  trc.player.tryout_id = $routeParams.id;
  console.log(trc.player.tryout_id);
  trc.reviewPlayer = function(){
    TryoutService.scorePlayer(trc.player);
  }
}]);  //  TryoutReviewController


app.controller('PlayerNumberController', ['$routeParams', 'TryoutService', function($routeParams, TryoutService){
  var pc = this;

  pc.playerProfiles = [];
  pc.playersList = TryoutService.data;

  pc.tryout_id = $routeParams.id;

  pc.savePlayers = function(){
    for (var i = 0; i < pc.playersList.val.length; i++) {
      pc.profileInfo = {};
      pc.profileInfo.survey_id = pc.playersList.val[i].survey_result_id;
      pc.profileInfo.first_name = pc.playersList.val[i].qu_el_3797779;
      pc.profileInfo.last_name = pc.playersList.val[i].qu_el_3797780;
      pc.profileInfo.level = pc.playersList.val[i].qu_el_3797961;
      pc.profileInfo.jerseyNum = pc.playersList.val[i].alias;

      pc.playerProfiles.push(pc.profileInfo);
    }

    console.log(pc.playerProfiles);
    // TryoutService.savePlayersToDb(pc.tryout_id);
  }

  TryoutService.getPlayers();
}]);


app.controller('AppController', ['UserService', function(UserService) {
  var vm = this;
  vm.user = UserService.user;

  UserService.isAuthenticated(function(status, user) {
    console.log(status);
  });
}]);


app.controller('LoginController', ['$http','UserService', 'TryoutService', function($http, UserService, TryoutService){
  var lc = this;
  lc.tryouts = [];
  lc.guest = {};

  lc.tryouts = TryoutService.data;

  UserService.isAuthenticated(function(status) {
    if (status === true) {
      TryoutService.fetchTryouts();
    }

    lc.generateGuestCode = function(info) {
      TryoutService.generateCode(info);
    };
  });

  lc.guestLogin = function(){
    UserService.guestAuthentication(lc.guest, function(status) {
      if(status === true) {
        console.log('Code worked!');
      } else {
        console.log(':(');
      }
    });
  };

  lc.deleteTryout = function(tryout) {
    TryoutService.deleteTryout(tryout);
  };
}]);  //  LoginController

app.controller('TryoutInputController', ['TryoutService', 'UserService', '$location',  function(TryoutService, UserService, $location) {
  var tic = this;

  UserService.isAuthenticated(function(status) {
    if (status === true) {
      var num = 1;

      // tic.curDate = new Date();
      // tic.curTime = new Date();

      tic.tryout = {};
      tic.categories = [{'id': 1}];

      tic.addField = function() {
        num += 1;
        tic.categories.push({'id':num});
      };  //  addFields

      tic.removeField = function(id) {
        tic.categories.splice(id, 1);
      };  //  removeField

      tic.submitInfo = function() {
        tic.tryout.categories = tic.categories;
        TryoutService.saveTryoutInfo(tic.tryout);
      };  //  submitInfo
    } else {
      $location.path('/');
    }
  }); //  UserService

}]); //  TryoutInputController


app.controller('EditController', ['TryoutService', '$routeParams', function(TryoutService, $routeParams) {
  var ec = this;

}]);  //  ReviewController


app.controller('LogoutController', ['UserService', '$templateCache','$location', function(UserService, $templateCache, $location) {
  var vm = this;

  // Remove cached page
  $templateCache.removeAll();

  // Check if user is logged in
  UserService.isAuthenticated(function(status) {
    if (status === true) {
      UserService.logout(function() {
        // Redirect
        $location.path('/');
      });
    } else {
      // Redirect
      $location.path('/');
    }
  }); //  UserService.isAuthenticated
}]);  //  LogoutController

app.controller('ArchivesController', function(){
  var vm = this;
});
