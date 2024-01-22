const jwt = require("jsonwebtoken")
require('dotenv').config();
class adminJWT{

async verifyToken(req, res, next){
 
try{
    const header = req.headers.authorization;
    const token = header.split(' ')[1]     
    if(token!=""){
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user_id = decoded.user_id;
          next();
         }
    else{
        return res.status(400).send({ status: false, massage: "Token has been expired!" })
      }
}
catch (err){
return res.status(400).send({ status: false, massage: "Required Authencation!" })
}
   

}



}

const JWTadmin = new adminJWT();
module.exports = JWTadmin;