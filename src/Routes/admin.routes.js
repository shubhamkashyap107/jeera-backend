const express = require("express")
const router = express.Router()
const{ authorize, isLoggedIn, isOrganizationActive} = require("../Middlewares/index")
const { addTeam, getAllTeams, getTeamById, deleteTeam, updateTeam } = require("../Controllers/admin.controller")

router.post(
    "/teams", 
    isLoggedIn, 
    isOrganizationActive,
    authorize("admin"), 
    addTeam
)

router.get(
    "/teams",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    getAllTeams
)

router.get(
    "/teams/:id",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    getTeamById
)

router.delete(
    "/teams/:id",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    deleteTeam
)


router.patch(
    "/teams/:id",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    updateTeam
)







module.exports = {
    AdminRouter : router
}