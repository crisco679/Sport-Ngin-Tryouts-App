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
    .when('/review', {
      templateUrl: '/app/view/review',
      controller: 'ReviewInputController',
      controllerAs: 'rev'
    })
    .when('/players', {
      templateUrl: '/app/view/players',
      controller: 'PlayerNumberController',
      controllerAs: 'num'
    })

  $locationProvider.html5Mode(true);
}]);  //  app.config

//////////////////////////////////////////////////////////////////////////////////
//  Controllers
//////////////////////////////////////////////////////////////////////////////////


app.controller('PlayerNumberController', function(){

});


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

  UserService.isAuthenticated(function(status) {
    if (status === true) {
      var fetchTryouts = function(){
        $http.get('/app/view/data').then(function(response){
          if(response.status !== 200){
            console.log('Failed to fetch tryouts');
          }
          lc.tryouts = response.data;
          console.log(response.data);
          return response.data;
        });
      };
      fetchTryouts();
    }

    lc.generateGuestCode = function(info) {
      TryoutService.generateCode(info);
      fetchTryouts();
    };
  });

  lc.guestLogin = function(){
    console.log(lc.guest);
    UserService.guestAuthentication(lc.guest);
  };
}]);  //  LoginController

app.controller('TryoutInputController', ['TryoutService', 'UserService', '$location',  function(TryoutService, UserService, $location) {
  var tic = this;

  UserService.isAuthenticated(function(status) {
    if (status === true) {
      var num = 1;

      tic.curDate = new Date();
      tic.curTime = new Date();

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



app.controller('TryoutManagementController', ['$http', function($http){
  var tmc = this;

}]);  //  tryoutManagementController


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
