(function()
{
    angular
        .module("Rayan")
        .controller("AdminController", AdminController);

    function AdminController($scope, $http, $rootScope, $location)
    {

        $scope.todaysDate = getTodaysDate();
        $scope.date = new Date($scope.todaysDate);
        $scope.totalBasketsRemaining = 0;

        $scope.dateChanged = function(){
            $scope.getCustomerBaskets($scope.date);
        };

        $scope.logout = function()
        {
            $http.post("/logout")
                .success(function()
                {
                    $rootScope.currentUser = null;
                    $location.url("/login");
                });
        };

        $http.get("/rest/customers")
            .success(function(customers){
                $scope.customers = customers
            });

        $scope.getCustomers = function(){
            $http.get("/rest/customers")
                .success(function(customers){
                    $scope.customers = customers
                });
        };

        $http.get("/rest/customerBaskets/" + new Date())
            .success(function (customerBaskets) {
                $scope.customers.forEach(function(customer, index){
                    customerBaskets.forEach(function(customerBasket){
                        if(customer.customerName == customerBasket.customerName){
                            $scope.customers[index] = customerBasket;
                            $scope.customers[index].basketsRemaining = customer.basketsRemaining;
                            $scope.totalBasketsRemaining +=  customerBasket.basketsRemaining;

                        }
                    })
                })
            });

        $scope.getCustomerBaskets = function(date){
            $scope.totalBasketsRemaining = 0;
            $scope.getCustomers();
            if(!date) {
                $http.get("/rest/customerBaskets/" + new Date())
                    .success(function (customerBaskets) {
                        $scope.customers.forEach(function(customer, index){
                            customerBaskets.forEach(function(customerBasket){
                                if(customer.customerName == customerBasket.customerName){
                                    $scope.customers[index] = customerBasket;
                                    $scope.customers[index].basketsRemaining = customer.basketsRemaining;
                                    $scope.totalBasketsRemaining +=  customerBasket.basketsRemaining;

                                }
                            })
                        })
                    });
            }else{
                $http.get("/rest/customerBaskets/" + date)
                    .success(function (customerBaskets) {
                        $scope.customers.forEach(function(customer, index){
                            customerBaskets.forEach(function(customerBasket){
                                if(customer.customerName == customerBasket.customerName){
                                    $scope.customers[index] = customerBasket;
                                    $scope.customers[index].basketsRemaining = customer.basketsRemaining;
                                    $scope.totalBasketsRemaining +=  customerBasket.basketsRemaining;
                                }
                            })
                        })
                    });
            }
            $
        };

        $scope.addCustomer = function()
        {

            if(!$scope.newCustomerName || !$scope.newCustomerName.length > 1 || !(/^[a-zA-Z]+$/.test($scope.newCustomerName))){
                toastr.error("Enter valid name","Error");
                return;
            }

            $http.post("/rest/addCustomer", {"customerName" : $scope.newCustomerName})
                .then(function(){
                    toastr.success("Customer added");
                    $scope.getCustomers();
                    $scope.newCustomerName = "";
                    $scope.getCustomerBaskets();
                },
                function(res){
                    if(res.status == 400){
                        toastr.error("Customer already exists", "Error");
                    }
                });
        };

        $scope.updateCustomerBaskets = function(index)
        {
            var customerName = $scope.customers[index].customerName;
            var quantityTaken = $scope.customers[index].quantityTaken;
            var quantityReturned = $scope.customers[index].quantityReturned;
            if(!checkDateIsValid($scope.date)){
                toastr.error("Please select a valid date","Error");
                return;
            }

            if(quantityTaken == undefined && quantityReturned == undefined){
                toastr.warning("Please enter a value");
                return;
            }

            if(quantityTaken != undefined){
                if(isNaN(quantityTaken) || quantityTaken < 0){
                    toastr.warning("Please enter a valid number for baskets taken");
                    return;
                }
            }
            if(quantityReturned != undefined){
                if(isNaN(quantityReturned) || quantityReturned < 0){
                    toastr.warning("Please enter a valid number for baskets returned");
                    return;
                }
            }

            $http.post("/rest/updateCustomer", {"date" : $scope.date, "customerName" : customerName, "quantityTaken" : quantityTaken, "quantityReturned" : quantityReturned})
                .then(function(){
                    $scope.getCustomerBaskets($scope.date);
                    toastr.success("Basket Updated");
                },
                function(res){
                    if(res.status == 400){
                        toastr.error("Did not save - Please enter valid numbers or Date", "Error");
                    }
                });

        }
        //
        //$scope.remove = function(user)
        //{
        //    $http.delete('/rest/user/'+user._id)
        //        .success(function(users){
        //            $scope.users = users;
        //        });
        //}
        //
        //$scope.update = function(user)
        //{
        //    $http.put('/rest/user/'+user._id, user)
        //        .success(function(users){
        //            $scope.users = users;
        //        });
        //}
        //
        //$scope.add = function(user)
        //{
        //    $http.post('/rest/user', user)
        //        .success(function(users){
        //            $scope.users = users;
        //        });
        //}
        //
        //$scope.select = function(user)
        //{
        //    $scope.user = user;
        //}
    }

    function checkDateIsValid(date){
        //date limit is hardcoded to be between 2015 and 2020
        if(date < new Date("01/01/2015") || date > new Date("01/01/2020")){
            return false;
        }else{
            return true;
        }

    }

    function getTodaysDate(){
        var hoy = new Date(),
            d = hoy.getDate(),
            m = hoy.getMonth()+1,
            y = hoy.getFullYear(),
            date;

        if(d < 10){
            d = "0"+d;
        };
        if(m < 10){
            m = "0"+m;
        };

        date = y+"-"+m+"-"+d;
        return date;
    };
})();