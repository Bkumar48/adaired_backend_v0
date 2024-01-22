// const crypto = require('crypto');
// const algorithm = 'aes-256-cbc'; //Using AES encryption
// const key = "this-is-123-web-site-broken-!^*#";
// const iv = "web-site-broken-";
// //Encrypting text
//  function encrypt(text) {
//     let cipher = crypto.createCipheriv(algorithm, key, iv);
//     let encrypted = cipher.update(text,"utf8", "hex");
//     encrypted += cipher.final("hex");
//     return   encrypted;
//  }
//  // Decrypting text
// function decrypt(text) {
//     let decipher = crypto.createDecipheriv(algorithm, key, iv);
//     let decrypted = decipher.update(text,"hex", "utf8");
//     decrypted =  decipher.final("utf8");
//     return decrypted;
//  }

function encrypt(text) {
    let bufferObj = Buffer.from(text, "utf8");
    let base64String = bufferObj.toString("base64");
     return base64String
     }

     function decrypt(text) {
        let bufferObj1 = Buffer.from(text, "base64");
        let decodedString = bufferObj1.toString("utf8");         
        return decodedString
    }



 module.exports = {encrypt, decrypt }