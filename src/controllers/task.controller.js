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
        completedAt,
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
        completedAt: completedAt || null, 
        estimatedHours: estimatedHours || 0, 
        storyPoints: storyPoints || 0, 
        position: position || 0
    });

    return res.status(201).json(
        new ApiResponse(201, task, "Task created successful")
    );
});

// ── Task update method ──────────────────────────────────────────
export const updateTask = asyncHandler(async (req, res) => {
    const {
        title, 
        description, 
        status, 
        priority, 
        assignedTo, 
        dueDate, 
        tags, 
        position
    } = req.body;

    const user = req.user;
    const org = req.organization
    const projectId = req.params.projectId;

    const checkProject = await Project.findOne({_id: projectId, organization: org._id, isDeleted: false});

    if(!checkProject){
        throw new ApiError(404, "Project not found");
    }

    const task = await Task.findOne({_id: req.params.taskId, organization: org._id, project: projectId, isDeleted: false});

    if(!task){
        throw new ApiError(404, "Task not found");
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

    if(title) task.title = title.trim();

    if (description !== undefined) {
        task.description = description;
    }

    if (status) {
        task.status = status;

        // Auto manage completedAt
        if (status === "done") {
            task.completedAt = new Date();
        } else {
            task.completedAt = null;
        }
    }

    if (priority) task.priority = priority;

    if (assignedTo !== undefined) {
        task.assignedTo = assignedTo;
    }

    if (dueDate !== undefined) {
        task.dueDate = dueDate;
    }

    if (tags) task.tags = tags;

    if (position !== undefined) {
        task.position = position;
    }

    await task.save();

    return res.status(200).json(
        new ApiResponse(200, task, "Task updated successful")
    );
});

// ── Task delete method ──────────────────────────────────────────
export const deleteTask = asyncHandler(async (req, res) => {
    const checkProject = await Project.findOne({_id: req.params.projectId, organization: req.organization._id, isDeleted: false});

    if(!checkProject){
        throw new ApiError(404, "Project not found");
    }

    const task = await Task.findOne({_id: req.params.taskId, organization: req.organization._id, project: req.params.projectId, isDeleted: false});

    if(!task){
        throw new ApiError(404, "Task not found");
    }

    task.isDeleted = true;
    await task.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Task deleted successful")
    );
});

// ── Task list method ──────────────────────────────────────────
export const taskList = asyncHandler(async (req, res) => {
    // Base match
    const filter = {
        project: req.params.projectId,
        organization: req.organization._id,
        isDeleted: false
    };

    if(req.query.status) filter.status = status;
    if(req.query.priority) filter.priority = priority;
    if(req.query.assignedTo) filter.assignedTo = assignedTo;

    if(req.query.search){
        const regex = new RegExp(req.query.search, "i");
        filter.$or = [{title: regex}, {description: regex}];
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    const sort = {[sortBy]:order};

    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
                            .sort(sort)
                            .skip(skip)
                            .limit(limit)
                            .populate("assignedTo", "name email")
                            .populate("createdBy", "name email");


    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                tasks,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }, 
            "Tasks fetched successfully"
        )
    );
});

// ── Task detail method ──────────────────────────────────────────
export const taskDetail = asyncHandler(async (req, res) => {
    const checkProject = await Project.findOne({_id: req.params.projectId, organization: req.organization._id, isDeleted: false});

    if(!checkProject){
        throw new ApiError(404, "Project not found");
    }

    const task = await Task.findOne({_id: req.params.taskId, organization: req.organization._id, project: req.params.projectId, isDeleted: false});

    if(!task){
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, task, "Task fetched successful")
    );
});