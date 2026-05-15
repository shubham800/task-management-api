import Task from "../models/Task.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import Project from "../models/Project.js";

// ── Task create method ──────────────────────────────────────────
export const createTask = asyncHandler(async (req, res) => {
    const {
        title, 
        description, 
        status, 
        priority, 
        assignedTo, 
        dueDate, 
        tags, 
        estimatedHours, 
        storyPoints, 
        position
    } = req.body;

    if(!title || !title.trim()){
        throw new ApiError(400, "Title is required");
    }

    const user = req.user;
    const org = req.organization
    const projectId = req.params.projectId;

    const checkProject = await Project.findOne({_id: projectId, organization: org._id, isDeleted: false});

    if(!checkProject){
        throw new ApiError(404, "Project not found");
    }

    // Validate assignee if provided
    if (assignedTo) {

        const assignee = await User.findById(assignedTo);

        if (!assignee) {
            throw new ApiError(404, "Assigned user not found");
        }

        const member = org.members.find(
            m => m.user.toString() === assignedTo
        );

        if (!member) {
            throw new ApiError(
                400,
                "Assigned user is not a member of this organization"
            );
        }
    }

    const task = await Task.create({
        title: title.trim(), 
        description: description || null, 
        status, 
        priority,
        project: projectId, 
        organization: org._id,
        assignedTo: assignedTo || null, 
        createdBy: user._id,
        dueDate: dueDate || null,
        tags: tags || [], 
        estimatedHours: estimatedHours || 0, 
        storyPoints: storyPoints || 0, 
        position: position || 0
    });

    return res.status(201).json(
        new ApiResponse(201, task, "Task created successful")
    );
});