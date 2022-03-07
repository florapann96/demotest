////module.exports = {

////    /*database: 'mongodb://localhost:27017/myuser'*/
////    database: 'mongodb+srv://pppadmin:testing123@cluster0.pzqdl.mongodb.net/bookdemo?retryWrites=true&w=majority'
////}
if (process.env.NODE_ENV == "production") {

    module.exports = require("./prod")

} else {

    module.exports = require("./dev")
}