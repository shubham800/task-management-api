import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const taskSchema = new mongoose.Schema({
    title : {
        type: String, 
        required: [true, "Title required"],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ""
    },
    status: {
        type: String, 
        enum: ["todo","in-progress","in-review","done"], 
        default: "todo"
    },
    priority: {
        type: String, 
        enum: ["low","medium","high","critical"], 
        default: "medium"
    },
    project: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Project", 
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    dueDate: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    attachments: [attachmentSchema],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    estimatedHours: {
        type: Number,
        min: 0,
        default: 0
    },
    storyPoints: {
        type: Number,
        min: 0,
        default: 0
    },
    position: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {timestamps: true});

// Indexes
taskSchema.index({ project: 1 });
taskSchema.index({ organization: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;