import Project from "../models/Project.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateSlug from "../utils/generateSlug.js";

// ── Project create method ──────────────────────────────────────────
export const createProject = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    if(!name || !name.trim()){
        throw new ApiError(400, "Name is required");
    }

    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness inside same organization
    while (await Project.findOne({
        slug,
        organization: req.organization._id,
        isDeleted: false
    })) {
        slug = `${baseSlug}-${counter++}`;
    }

    const project = await Project.create({
        name: name.trim(), 
        slug,
        description, 
        organization: req.organization._id,
        createdBy: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(201, project, "Project created successful")
    );
});

// ── Project create method ──────────────────────────────────────────
export const getProjectList = asyncHandler(async (req, res) => {
    const {search, page = 1, limit = 10} = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Base match
    const matchStage = {
        organization: req.organization._id,
        isDeleted: false
    };

    // Add search if provided
    if(search){
        matchStage.name = {$regex: search, $options: "i"};
    }

    // Total counts
    const total = await Project.countDocuments(matchStage);

    const projects = await Project.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdByDetails"
            }
        },
        {
            $unwind: {
                path: "$createdByDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                name: 1,
                slug: 1,
                description: 1,
                createdAt: 1,
                "createdByDetails._id": 1,
                "createdByDetails.name": 1,
                "createdByDetails.email": 1,
            }
        },
        {
            $sort: {createdAt: -1}
        },
        { $skip: skip },
        { $limit: Number(limit) }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                projects,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }, 
            "Projects fetched successfully"
        )
    );
});

// ── Project update method ──────────────────────────────────────────
export const updateProject = asyncHandler(async (req, res) => {
    const {name, description} = req.body;
    const {projectId} = req.params;
    const orgId = req.organization._id;

    if(!name || !name.trim()){
        throw new ApiError(400, "Name is required");
    }

    const project = await Project.findOne({_id: projectId, organization: orgId, isDeleted: false});

    if(!project){
        throw new ApiError(404, "Project not found");
    }

    let slug = project.slug;

    if(name.trim() !== project.name){
        const baseSlug = generateSlug(name);
        slug = baseSlug;
        let counter = 1;
    
        // Ensure slug uniqueness inside same organization
        while (await Project.findOne({
            slug,
            organization: orgId,
            isDeleted: false,
            _id: {$ne: projectId}
        })) {
            slug = `${baseSlug}-${counter++}`;
        }
    }

    project.name = name.trim();
    project.slug = slug;
    if (description !== undefined) project.description = description;

    await project.save();

    return res.status(200).json(
        new ApiResponse(200, project, "Project updated successful")
    );
});

// ── Project delete method ──────────────────────────────────────────
export const deleteProject = asyncHandler(async (req, res) => {
    const {projectId} = req.params;
    const orgId = req.organization._id;

    const project = await Project.findOne({_id: projectId, organization: orgId, isDeleted: false});

    if(!project){
        throw new ApiError(404, "Project not found");
    }

    project.isDeleted = true;

    await project.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Project deleted successfully")
    );
});