var validateEmail = function(text) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(text)
};

var validatePassword = function (text){
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]{0,1}.*$).{8}$/;
    return re.test(text)

};

var validatePhone = function (text, minDigitsCount, maxDigitsCount ){
    var str = text.trim();
    if (str) {
        var len,
            isPlus = ("+" === str[0]),
            defMin = isPlus ? 11 : 10, // 10 digits is standard w/o country code for the US, Canada and many other countries. 
            defMax = isPlus ? 14 : 11; // 11 digits maximum w/o country code (China) or 14 with country code (Austria).

        if ((str = str.match(/\d/g)) && (str = str.join(""))) { // all digits only!
            len = str.length;
          //   return str;
            return len >= (minDigitsCount || defMin) &&
                 len <= (maxDigitsCount || defMax);
        }
    }

}
var phoneDigit = function(text){
    var re = /^\d{10}$/;
    return re.test(text)
}

var alphabet = function (text){
    var re = /^[A-Za-z]+$/;
    return re.test(text)

};

function formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      var intlCode = (match[1] ? '1' : '');
      return [intlCode, match[2],  match[3],  match[4]].join('');
    }
    return null;
  }

// function coupnCode(text){
//     var re = /^(?=.*[#]{1})(?=.*[0-9]{4})(?=.*[A-Z]{4}.*$).{9}$/;
//     return re.test(text)
// }  

function coupnCode(text){
    var re = /^([0-9-A-Z])+$/;
    return re.test(text)
}  


var digits = function(text){
    var re = /^\d{1,3}$/;
    return re.test(text)
}

function dateFormat(text){
    var re = /(\d{2})-(\d{2})-(\d{4})/
    return re.test(text)
}
module.exports = {validateEmail, validatePassword, validatePhone, phoneDigit, alphabet,formatPhoneNumber,coupnCode,digits,dateFormat }