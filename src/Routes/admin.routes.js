const express = require("express")
const router = express.Router()
const{ authorize, isLoggedIn, isOrganizationActive} = require("../Middlewares/index")
const { addTeam, getAllTeams, getTeamById, deleteTeam, updateTeam, createEmployee, getAllEmployeesByTeamId, updateEmployee, deleteEmployee } = require("../Controllers/admin.controller")

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




/*
    - Admin's APIs for employees
*/



router.post(
    "/teams/:teamId/employees",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    createEmployee
)

router.get(
    "/teams/:teamId/employees",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    getAllEmployeesByTeamId
)



router.get(
    "/teams/:teamId/employees",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    getAllEmployeesByTeamId
)



router.get(
    "/teams/:teamId/employees",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    getAllEmployeesByTeamId
)



router.patch(
    "/employees/:employeeId",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    updateEmployee
)



router.delete(
    "/employees/:employeeId",
    isLoggedIn,
    isOrganizationActive,
    authorize("admin"),
    deleteEmployee
)







module.exports = {
    AdminRouter : router
}