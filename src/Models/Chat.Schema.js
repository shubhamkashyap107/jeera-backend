const mongoose = require("mongoose")


const ChatSchema = new mongoose.Schema({
    text : {
        type : String,
        required : true,
        trim : true,
        maxLength : 1000
    },
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "User"
    }
}, {timestamps : true})

ChatSchema.index({ sender : 1, receiver : 1 })

const Chat = mongoose.model("Chat", ChatSchema)

module.exports = {
    Chat
}