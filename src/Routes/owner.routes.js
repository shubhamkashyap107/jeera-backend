const express = require("express")
const { isLoggedIn } = require("../Middlewares/isLoggedIn")
const { authorize } = require("../Middlewares/authorize")
const{ createOrg, getAllOrgs, getOrgsById, deleteOrg, updateOrg} = require('../Controllers/owner.controller')

const router = express.Router()


router.post("/", isLoggedIn, authorize('owner'), createOrg)
router.get("/", isLoggedIn, authorize("owner"), getAllOrgs)
router.get("/:id", isLoggedIn, authorize("owner"), getOrgsById)
router.delete("/:id", isLoggedIn, authorize("owner"), deleteOrg)
router.patch("/:id", isLoggedIn, authorize("owner"), updateOrg)




module.exports = {
    OwnerRouter : router
}