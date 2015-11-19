(function() {
    angular
        .module("Rayan")
        .controller("CustomerCtrl", CustomerCtrl);

    function CustomerCtrl($scope, $http, $routeParams) {

        $scope.customerName = $routeParams.customerName;

        $http.get("/rest/customerbasket/" + $scope.customerName)
            .then(function(res){
                $scope.customerBaskets = res.data;
            }, function(res){
                $sope.errorMsg = "Unable to get customer baskets";
            })
    };
})();