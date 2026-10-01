const { User } = require("../Models/User.schema")

const getChatsInfo = async(req, res) => {

    const allEmployees = await User.find({
        organizationId : req.user.organizationId._id,
        isActive : true,
        _id : {
            $ne : req.user._id
        }
    })

    res
    .status(200)
    .json({
        data : allEmployees
    })

}


module.exports = {
    getChatsInfo
}