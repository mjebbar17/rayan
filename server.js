var express       = require('express');
var app           = express();
var bodyParser    = require('body-parser');
var multer        = require('multer');
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser  = require('cookie-parser');
var session       = require('express-session');
var mongoose      = require('mongoose');
var db            = mongoose.connect('mongodb://localhost/Rayan');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

var BasketSchema = new mongoose.Schema(
    {
        customerName: String,
        date: Date,
        quantityTaken : Number,
        quantityReturned : Number
    });

var BasketModel = mongoose.model('BasketModel', BasketSchema);

var UserSchema = new mongoose.Schema(
    {
        username : String,
        password : String
    }
);

var UserModel = mongoose.model("UserModel", UserSchema);

var CustomerSchema = new mongoose.Schema(
    {
        customerName : String,
        basketsRemaining : Number
    }
);

var CustomerModel = mongoose.model("CustomerModel", CustomerSchema);

//var admin = new UserModel({username : "admin", password : "rayan"});
//admin.save();


passport.use(new LocalStrategy(
    function(username, password, done)
    {
        UserModel.findOne({"username": username, "password": password}, function(err, user)
        {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        })
    }));

passport.serializeUser(function(user, done)
{
    done(null, user);
});

passport.deserializeUser(function(user, done)
{
    UserModel.findById(user._id, function(err, user)
    {
        done(err, user);
    });
});

app.post("/login", passport.authenticate('local'), function(req, res)
{
    var user = req.user;
    res.json(user);
});

app.get('/loggedin', function(req, res)
{
    res.send(req.isAuthenticated() ? req.user : '0');
});

app.post('/logout', function(req, res)
{
    req.logOut();
    res.send(200);
});

var auth = function(req, res, next)
{
    if (!req.isAuthenticated())
    {
        res.send(401);
    }
    else
    {
        next();
    }
};

app.get("/rest/customerBaskets/:date", auth, function(req, res)
{

    var start = new Date(req.params.date);
    start.setHours(0,0,0,0);

    var end = new Date(req.params.date);
    end.setHours(23,59,59,999);

    BasketModel.find({"date": {"$gte": start, "$lt": end}}, function(err, users)
    {
        res.json(users);
    });
});

app.post("/rest/updateCustomer", auth, function(req, res) {

    var start = new Date(req.body.date);
    start.setHours(0,0,0,0);

    var end = new Date(req.body.date);
    end.setHours(23,59,59,999);

    if(isNaN(start.getTime()) || isNaN(end.getTime())){
        res.status(400);
        res.send("invalid date");
        return;
    }

    if(start > new Date()) {
        res.status(400);
        res.send("future date");
        return;
    }

    var quantityTaken = (req.body.quantityTaken == undefined) ? 0 : req.body.quantityTaken  ;
    var quantityReturned = (req.body.quantityReturned == undefined) ? 0 : req.body.quantityReturned  ;

    if((isNaN(quantityTaken) || quantityTaken < 0) || isNaN(quantityReturned) || quantityReturned < 0){
        res.status(400);
        res.send("error");
        return;
    }


    BasketModel.findOne({"date": {"$gte": start, "$lt": end}, "customerName" : req.body.customerName}, function(err, basket)
    {
        if(err) res.send(err);

        if(!basket){
            var newBasketForCustomer = new BasketModel({customerName : req.body.customerName, date : new Date(req.body.date)});
            newBasketForCustomer.quantityTaken = quantityTaken;
            newBasketForCustomer.quantityReturned = quantityReturned;
            CustomerModel.findOne({customerName : newBasketForCustomer.customerName}, function(err , customer){
                customer.basketsRemaining += newBasketForCustomer.quantityTaken - newBasketForCustomer.quantityReturned;
                customer.save();
                newBasketForCustomer.save();
                res.sendStatus(200);
            });

        }else {
            CustomerModel.findOne({customerName: basket.customerName}, function (err, customer) {

                customer.basketsRemaining -= basket.quantityTaken - basket.quantityReturned;
                customer.basketsRemaining += quantityTaken - quantityReturned;
                basket.quantityTaken = quantityTaken;
                basket.quantityReturned = quantityReturned;
                basket.save();
                customer.save();
                res.sendStatus(200);
            });
        }
    });
});

app.post("/rest/addCustomer", auth, function(req, res)
{

    CustomerModel.findOne({customerName : req.body.customerName}, function(err, doc){
        if(doc){
            res.sendStatus(400);
        }else{
            var newCustomer = new CustomerModel({customerName: req.body.customerName, basketsRemaining: 0});
            newCustomer.save();
            res.sendStatus(201);
        }
    });

});

app.get("/rest/customers", auth, function(req, res)
{
    CustomerModel.find({},function(err,doc){
        res.json(doc);
    })
});

app.get("/rest/customerbasket/:name", auth, function(req, res)
{
    BasketModel.find({customerName : req.params.name},function(err,doc){
        res.json(doc);
    })
});

app.listen(3000);