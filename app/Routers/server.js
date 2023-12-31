'use strict';
var http = require('http');
// var https = require('https');
// var privateKey  = fs.readFileSync('certificates/key.pem', 'utf8');
// var certificate = fs.readFileSync('certificates/cert.pem', 'utf8'); 
//var credentials = {key: privateKey, cert: certificate};
const express = require('express');
const cors = require('cors');
const app = express();
const db = require("./app/Database/db")
// const adminRoute = require("./app/Routers/AdminRoutes")
const productRoute = require("./app/Routers/ProductRoute")
const pageRoute = require("./app/Routers/PageRoute")
const faqRoute = require("./app/Routers/FaqRoute")
const customerRoute = require("./app/Routers/CustomerRoute")
const ticketRoute = require("./app/Routers/TicketRoute")
const userRoute = require("./app/Routers/UserRoute")
const userRoleRoute = require("./app/Routers/RoleRouter")
const blogCateRoute = require("./app/Routers/BlogCateRoute")
const blogRoute = require("./app/Routers/BlogRoute")
const couponRoute = require("./app/Routers/CouponRoute")
const cartRoute = require("./app/Routers/CartRoute")
const orderRoute = require("./app/Routers/OrderRoutes")
const userOrderRoute = require("./app/Routers/UserOrderRoute")
const adminOrderRoute = require("./app/Routers/AdminOrderRoute")
const testimonialRoute = require("./app/Routers/TestimonialRoute")
const priceRuleRoute = require("./app/Routers/PriceRulesRoute")
const frontRoute = require("./app/Routers/FrontRouter")

require('dotenv').config();
const port = process.env.NODE_PORT || 3000;


app.use(express.static('public')); 
app.use('/images', express.static('images'));
 
app.use('/pdf', express.static('pdf'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// set the view engine to ejs
app.set('view engine', 'ejs');

// index page

// res.locals is an object passed to hbs engine
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

// Define admin route
//app.use("/api/v1/admin",adminRoute);

app.use("/api/v1/",frontRoute)

// Define product route
app.use("/api/v1/product",productRoute)

// Define Page route
app.use("/api/v1/pages",pageRoute)

// Define FQA route
app.use("/api/v1/faq", faqRoute)

// Define Customer route
app.use("/api/v1/customer",customerRoute)

// Define User Ticket route
app.use("/api/v1/ticket",ticketRoute)

// Define user route
app.use("/api/v1/user",userRoute)

// Define user role route
app.use("/api/v1/users/roles",userRoleRoute)

// Define blog in user/ admin access
app.use("/api/v1/user/blogcate",blogCateRoute)

// Define blog in user/admin access
app.use("/api/v1/user/blog",blogRoute)

// Define coupon in user/admin access
app.use("/api/v1/admin/coupon",couponRoute) 

// Define cart 
app.use("/api/v1/cart",cartRoute)

// Define Order 
app.use("/api/v1/order",orderRoute)

// Define user Order route
app.use("/api/v1/user/order",userOrderRoute)

// Define admin order route
app.use("/api/v1/admin/order",adminOrderRoute)

// Define testimonial route
app.use("/api/vi/admin/testimonial",testimonialRoute)

// Define Price and Rules
app.use("/api/v1/admin/pricerules",priceRuleRoute)


// defualt route to test the api
   app.get("/", (req, res, next) => {
       res.json({massage:"App is working! :)"});
   });




// Create Server 
var server = http.createServer(app)    
 
// Create https server
//var httpsServer = https.createServer(credentials, app);

// Run server
server.listen(port, ()=>{
    console.log(`web server at ${port} running..`)
}); 

//  Check DB Connect 
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("DB Connected successfully");
});
// For https
//httpsServer.listen(8443);