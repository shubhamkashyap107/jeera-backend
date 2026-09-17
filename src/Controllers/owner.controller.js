const { AppError } = require("../Utils/AppError")
const { Organization } = require("../Models/Organization.schema")
const mongoose = require("mongoose")


const createOrg = async(req, res) => {


    const { name, isActive } = req.body

    if(!name.trim() || name.trim().length > 100)
    {
        throw new AppError(400, "Invalid Name")
    }


    const createdOrg = await Organization.create({
        name,
        isActive,
        createdBy : req.user._id
    })


    res
    .status(201)
    .json({
        message : "Organization Created",
        data : createdOrg
    })

}


const getAllOrgs = async(req, res) => {

    const{skip, limit} = req.query

    const data = await Organization.find().limit(limit).skip(skip * limit)

    res
    .status(200)
    .json({
        data
    })
}

const getOrgsById =  async(req, res) => {
    const{ id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id))
    {
        throw new AppError(400, "Invalid ID")
    }
    
    const data = await Organization.findById(id)

    if(!data)
    {
        throw new AppError(404, "Organization not found")
    }

    res
    .status(200)
    .json({
        data
    })
}


const deleteOrg = async(req, res) => {
    const{ id } = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id))
    {
        throw new AppError("Invalid ID")
    }

    const data = await Organization.findByIdAndUpdate(id, {isActive : false}, {returnDocument : "after"}) // soft deletion hard delete


    if(!data)
    {
        throw new AppError(404, "Organization does not exists")
    }

    res
    .status(200)
    .json({
        message : "Organization Deleted",
        data
    })
}

const updateOrg =  async(req, res) => {

    const{ id } = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id))
    {
        throw new AppError("Invalid ID")
    }

    const{name, isActive} = req.body

    if(!name.trim() || name.trim().length > 100)
    {
        throw new AppError(400, "Invalid Name")
    }

    const updatedOrg = await Organization.findByIdAndUpdate(id, {name, isActive}, {runValidators : true, returnDocument : "after"})

    if(!updatedOrg)
    {
        throw new AppError(404, "Organization does not exists")
    }


    res
    .status(200)
    .json({
        message : "Organization Updated",
        data : updatedOrg
    })


}




module.exports = {
    createOrg, getAllOrgs, getOrgsById, deleteOrg, updateOrg
}