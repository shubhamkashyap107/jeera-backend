const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const cp = require("cookie-parser")
const { User } = require("./Models/User.schema")
const { Chat } = require("./Models/Chat.Schema")


// Same checks as isLoggedIn + isOrganizationActive + authorize("admin", "employee"),
// but for the socket handshake. The sender is always taken from the cookie,
// never from the client payload.
const authenticateSocket = async(socket, next) => {
    try
    {
        const{ token } = socket.request.cookies || {}

        if(!token)
        {
            return next(new Error("Please log in"))
        }

        const originalObject = jwt.verify(token, process.env.JWT_SECRET)
        const foundUser = await User.findById(originalObject._id).populate("organizationId")

        if(!foundUser || !foundUser.isActive)
        {
            return next(new Error("Unauthorised"))
        }

        if(!["admin", "employee"].includes(foundUser.role) || !foundUser.organizationId?.isActive)
        {
            return next(new Error("Unauthorised"))
        }

        socket.user = foundUser
        next()
    }
    catch(error)
    {
        next(new Error("Session expired, please log in again"))
    }
}


const initSocket = (server, allowedOrigins) => {

    const io = new Server(server, {
        cors : {
            origin : allowedOrigins,
            credentials : true
        }
    })

    // run cookie-parser on the handshake request so socket.request.cookies exists
    io.engine.use(cp())
    io.use(authenticateSocket)

    io.on("connection", (socket) => {

        // every user listens on their own room, so messages reach all their open tabs
        const userRoom = String(socket.user._id)
        socket.join(userRoom)

        socket.on("send-msg", async(data, ack) => {
            const reply = typeof ack == "function" ? ack : () => {}

            try
            {
                const text = typeof data?.text == "string" ? data.text.trim() : ""
                const receiver = data?.receiver

                if(!text || text.length > 1000)
                {
                    return reply({ error : "Message must be 1-1000 characters" })
                }

                if(!mongoose.Types.ObjectId.isValid(receiver) || String(receiver) == userRoom)
                {
                    return reply({ error : "Invalid receiver" })
                }

                // only chat within your own organization
                const foundReceiver = await User.findOne({
                    _id : receiver,
                    organizationId : socket.user.organizationId._id,
                    isActive : true
                })

                if(!foundReceiver)
                {
                    return reply({ error : "This person isn't available to chat with" })
                }

                const createdChat = await Chat.create({
                    text,
                    sender : socket.user._id,
                    receiver : foundReceiver._id
                })

                io.to(String(foundReceiver._id)).to(userRoom).emit("rec-msg", createdChat)
                reply({ data : createdChat })
            }
            catch(error)
            {
                reply({ error : "Message could not be sent" })
            }
        })
    })

    return io
}


module.exports = {
    initSocket
}
