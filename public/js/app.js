(function()
{
    angular.module("Rayan", ["ngRoute"]);
    
    angular.module("Rayan")
        .config(function($routeProvider) {
            $routeProvider
              .when('/admin', {
                  templateUrl: 'views/admin/admin.html',
                  controller: 'AdminController',
                  resolve: {
                      loggedin: checkLoggedin
                  }
              })
                .when("/customer/:customerName", {
                    templateUrl : "views/admin/customer.html",
                    controller : "CustomerCtrl",
                    resolve: {
                        loggedin: checkLoggedin,
                    }
                })
                .when('/login', {
                    templateUrl: 'views/login/login.html',
                    controller: 'LoginCtrl'
                })
              .otherwise({
                  redirectTo: '/login'
              });
        });
    
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope)
    {
        var deferred = $q.defer();
    
        $http.get('/loggedin').success(function(user)
        {
            $rootScope.errorMessage = null;
            // User is Authenticated
            if (user !== '0')
            {
                $rootScope.currentUser = user;
                deferred.resolve();
            }
            // User is Not Authenticated
            else
            {
                $rootScope.errorMessage = 'You need to log in.';
                deferred.reject();
                $location.url('/login');
            }
        });
        
        return deferred.promise;
    };

  
})();

