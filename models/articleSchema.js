const mongoose = require('mongoose');
const articleSchema = mongoose.Schema({
    title:{type:String},
    auther:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    description:{type:String}
})
module.exports = mongoose.model('article',articleSchema);