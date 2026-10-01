const express = require("express")
const { isLoggedIn, authorize, isOrganizationActive } = require("../Middlewares")
const { getChatsInfo } = require("../Controllers/chatsController")
const router = express.Router()

router.get(
    "/",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin", "employee"),
    getChatsInfo
)




module.exports = {
    ChatRouter : router
}