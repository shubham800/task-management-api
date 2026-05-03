import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    role: {type: String, enum: ["admin","manager","member"], default: "member"},
    joinedAt: {type: Date, default: Date.now},
}, {id: false});

const orgSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true, maxlength: 100},
    slug: {type: String, unique: true, lowercase: true},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    members: [memberSchema],
    isDeleted: {type: Boolean, default: false},
}, {timestamps: true});

// Index for performance
orgSchema.index({owner: 1});
orgSchema.index({"members.user": 1});

const Organization = mongoose.model("Organization", orgSchema);
export default Organization;