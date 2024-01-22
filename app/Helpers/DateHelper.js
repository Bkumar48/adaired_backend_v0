const moment = require("moment");


const utcDate =  function(data,typeDay){
    if(typeDay==1){
       return moment.utc(data,'DD-MM-YYYY').startOf('day')
    }
     if(typeDay==2){
        return moment.utc(data,'DD-MM-YYYY').endOf('day')
     }
    
}
module.exports = {utcDate}