const mongoose = require("mongoose")
const { Chat } = require("../Models/Chat.Schema")
const { User } = require("../Models/User.schema")
const { AppError } = require("../Utils/AppError")

const getChatsInfo = async(req, res) => {

    const allEmployees = await User.find({
        organizationId : req.user.organizationId._id,
        isActive : true,
        _id : {
            $ne : req.user._id
        }
    }).select("name email role")

    res
    .status(200)
    .json({
        data : allEmployees
    })

}







const getChats = async(req, res) => {

    const{ id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id))
    {
        throw new AppError(400, "Invalid ID")
    }

    const foundChats = await Chat.find({
        $or : [
            {
                sender : req.user._id,
                receiver : id
            },
            {
                sender : id,
                receiver : req.user._id
            }
        ]
    }).sort({_id : 1})


    res
    .status(200)
    .json({
        data : foundChats
    })
}











module.exports = {
    getChatsInfo,
    getChats
}