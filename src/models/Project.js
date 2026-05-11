import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name : {
        type: String, 
        required: [true, "Name required"],
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Organization", 
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {timestamps: true});

// Indexes
projectSchema.index({ organization: 1 });
projectSchema.index({ slug: 1, organization: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;