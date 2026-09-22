const mongoose = require("mongoose")
const { Team } = require("../Models/Team.schema")
const { AppError } = require("../Utils/AppError")
const { User } = require("../Models/User.schema")
const bcrypt = require("bcrypt")
const validator = require("validator")


const addTeam = async(req, res) => {


    const{ name }  = req.body

    if(!name.trim() || name.trim().length > 50)
    {
        throw new AppError(400, "Name is invalid")
    }

    const createdTeam = await Team.create(
        {
            name,
            adminId : req.user._id,
            organizationId : req.user.organizationId._id
        }
    )

    res
    .status(200)
    .json({
        message : "Team created successfully",
        data : createdTeam
    })


}

const getAllTeams = async(req, res) => {


    const organizationId = req.user.organizationId._id
    const foundTeams = await Team.find({organizationId})

    res
    .status(200)
    .json({
        data : foundTeams
    })
}

const getTeamById = async(req, res) => {
    const{ id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id))
    {
        throw new AppError(400, "Invalid ID")
    }

    const foundTeam = await Team.findOne({
        _id : id,
        organizationId : req.user.organizationId._id
    })

    if(!foundTeam)
    {
        throw new AppError(404, "Team does not exists")
    }

    res
    .status(200)
    .json({
        data : foundTeam
    })
}

const deleteTeam = async(req, res) => {

    const{ id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id))
    {
        throw new AppError(400, "Invalid ID")
    }


    const foundTeam = await Team.findOne({
        _id : id,
        organizationId : req.user.organizationId._id
    })

    if(!foundTeam)
    {
        throw new AppError(404, "Team does not exists")
    }

    foundTeam.isActive = false
    await foundTeam.save()

    res
    .status(200)
    .json({
        message : "Team deleted successfully",
        // data : foundTeam
    })



}

const updateTeam = async(req, res) => {
    const{ name, isActive } = req.body
    const{ id } = req.params

    if(!name.trim() || name.trim().length > 50)
    {
        throw new AppError(400, "Invalid name")
    }

    const foundTeam = await Team.findOne({
        _id : id,
        organizationId : req.user.organizationId._id
    })

    if(!foundTeam)
    {
        throw new AppError(404, "team does not exists")
    }

    foundTeam.isActive = true
    foundTeam.name = name

    await foundTeam.save()


    res
    .status(200)
    .json({
        message : "Team updated",
        data : foundTeam
    })
}

const createEmployee = async(req, res) => {
    
    const{ teamId } = req.params

    if(!mongoose.Types.ObjectId.isValid(teamId))
    {
        throw new AppError(400, "Invalid ID")
    }

    const foundTeam = await Team.findOne({
        _id : teamId,
        organizationId : req.user.organizationId._id
    })

    if(!foundTeam)
    {
        throw new AppError(404, "Team does not exists")
    }

    const{ name, password, email } = req.body

    if(!name.trim() || name.trim().length > 20 || name.trim().length < 2)
    {
        throw new AppError(400, "Invalid name")
    }

    if(!validator.isEmail(email))
    {
        throw new AppError(400, "Invalid Email")
    }

    if(!validator.isStrongPassword(password))
    {
        throw new AppError(400, "Please enter a strong password")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const createdUser = await User.create({
        password : hashedPassword,
        name, 
        email, 
        role : "employee",
        organizationId : req.user.organizationId._id,
        teamdId : teamId
    })

    res
    .status(201)
    .json({
        message :  `Employee (${name}) created successfully`,
        data : createEmployee
    })


}

const getAllEmployeesByTeamId = async(req, res) => {
    const{ teamId } = req.params

    if(!mongoose.Types.ObjectId.isValid(teamId))
    {
        throw new AppError(400, "Invalid ID")
    }

    const allEmployees = await User.find({
        teamdId : teamId,
        organizationId : req.user.organizationId._id
    })


    res
    .status(200)
    .json({
        data : allEmployees
    })

}


const deleteEmployee = async(req, res) => {
    const{ employeeId } = req.params

    if(!mongoose.Types.ObjectId.isValid(employeeId))
    {
        throw new AppError(400, "Invalid ID")
    }

    const foundEmployee = await User.findOne({
        _id : employeeId,
        organizationId : req.user.organizationId._id
    })


    if(!foundEmployee)
    {
        throw new AppError(404, "User does not exists")
    }

    foundEmployee.isActive = false
    await foundEmployee.save()

    res
    .status(200)
    .json({
        message : "User deleted"
    })
}

const updateEmployee = async(req, res) => {
    const{ employeeId } = req.params

    if(!mongoose.Types.ObjectId.isValid(employeeId))
    {
        throw new AppError(400, "Invalid ID")
    }

    // const foundEmployee = await User.findOne({
    //     _id : employeeId,
    //     organizationId : req.user.organizationId._id
    // })


    // if(!foundEmployee)
    // {
    //     throw new AppError(404, "User does not exists")
    // }
    

    const{teamId, isActive} = req.body
    // foundEmployee.teamdId = teamId
    // foundEmployee.isActive = isActive

    const foundEmployee = await User.findOneAndUpdate({_id : employeeId, organizationId : req.user.organizationId._id}, {teamdId : teamId, isActive}, {
        runValidators : true,
        returnDocument : "after"
    })

    User.fin


    // await foundEmployee.save()

    res
    .status(200)
    .json({
        message : "User Updated",
        data : foundEmployee
    })

}


module.exports = {
    addTeam, 
    getAllTeams,
    getTeamById,
    deleteTeam,
    updateTeam,
    createEmployee,
    getAllEmployeesByTeamId,
    deleteEmployee,
    updateEmployee
}