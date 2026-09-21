const mongoose = require("mongoose")
const { Team } = require("../Models/Team.schema")
const { AppError } = require("../Utils/AppError")

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



module.exports = {
    addTeam, 
    getAllTeams,
    getTeamById,
    deleteTeam,
    updateTeam
}