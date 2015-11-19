(function()
{
    angular
        .module("Rayan")
        .controller("LoginCtrl", LoginCtrl);

    function LoginCtrl($scope, $http, $location, $rootScope)
    {
        $scope.login = function(user)
        {
            $http.post("/login", user)
                .then(
                //success
                function(res)
                {
                    $rootScope.currentUser = res;
                    $location.url("/admin");
                }
                //error
                ,function(res){
                    if(res.status == 401){
                        toastr.error("Invalid Username/Password","Error");
                    }else if (res.status == 400){
                        toastr.warning("Please enter Username & Password");
                    }

                });
        };

    }

})();
