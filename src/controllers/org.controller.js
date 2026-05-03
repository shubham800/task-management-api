import Organization from "../models/Organization.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {generateAccessToken, generateRefreshToken, cookieOptions} from "../utils/generateTokens.js";
import crypto from "crypto";
import User from "../models/User.js";

export const generateSlug = (name) => {
    return name
        .toLowerCase()                // lowercase
        .trim()                      // remove extra spaces
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-")        // spaces → -
        .replace(/-+/g, "-");        // remove duplicate -
};

// ── Organization create method ──────────────────────────────────────────
export const createOrganization = asyncHandler(async (req, res) => {
    const {name} = req.body;

    if(!name){
        throw new ApiError(400, "Name is required");
    }

    const owner = req.user._id;

    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await Organization.findOne({ slug, isDeleted: false })) {
        slug = `${baseSlug}-${counter++}`;
    }

    const org = await Organization.create({
        name, 
        slug, 
        owner,
        members: [{
            user: owner,
            role: "admin"
        }]
    });

    return res.status(201).json(
        new ApiResponse(201, org, "Organization created successful")
    );
});

// ── Organization update method ──────────────────────────────────────────
export const updateOrganization = asyncHandler(async (req, res) => {
    const {name} = req.body;

    if(!name){
        throw new ApiError(400, "Name is required");
    }

    let slug = req.organization.slug;

    if(name !== req.organization.name){

        let baseSlug = generateSlug(name);
        slug = baseSlug;
        let counter = 1;

        while (await Organization.findOne({ slug, isDeleted: false })) {
            slug = `${baseSlug}-${counter++}`;
        }
    }

    const org = await Organization.findByIdAndUpdate(req.organization._id, {name, slug}, { new: true });

    return res.status(200).json(
        new ApiResponse(200, org, "Organization updated successful")
    );
});

// ── Organization delete method ──────────────────────────────────────────
export const deleteOrganization = asyncHandler(async (req, res) => {
    req.organization.isDeleted = true;
    await req.organization.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Organization deleted successful")
    );
});

// ── Organization detail method ──────────────────────────────────────────
export const organizationDetail = (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.organization, "Organization fetched")
    );
}

// ── Invite member method ──────────────────────────────────────────
export const inviteMemberToOrg = asyncHandler(async (req, res) => {
    const {email, role} = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({email});
    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const org = req.organization;

    const existingMember = org.members.some(m => 
        m.user.toString() === user._id.toString()
    );

    if(existingMember){
        throw new ApiError(409, "User is already a member of this organization");
    }

    const allowed = ["admin", "manager", "member"];

    if (!allowed.includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    // Owner-only admin assignment
    if (role === "admin" && req.user._id.toString() !== org.owner.toString()) {
        throw new ApiError(403, "Only owner can assign admin role");
    }   

    org.members.push({
        user: user._id,
        role: role || "member"
    });

    await org.save();

    return res.status(200).json(
        new ApiResponse(200, org, "Member added successfully")
    );
});

// ── Update role method ──────────────────────────────────────────
export const updateRole = asyncHandler(async (req, res) => {
    const {role} = req.body;
    const { userId } = req.params;

    const allowed = ["admin", "manager", "member"];

    if(!role || !allowed.includes(role)){
        throw new ApiError(400, "Invalid role");   
    }

    const org = req.organization;

    const member = org.members.find(m => 
        m.user.toString() === userId
    );

    if(!member){
        throw new ApiError(404, "Member not found");
    }

    // Owner protection
    if(userId === org.owner.toString()){
        throw new ApiError(403, "Cannot change the role of the organization owner");
    }

    // Prevent admin escalation
    if (role === "admin" && req.user._id.toString() !== org.owner.toString()) {
        throw new ApiError(403, "Only owner can assign admin role");
    }

    member.role = role;
    await org.save();

    return res.status(200).json(
        new ApiResponse(200, org, "Role updated successfully")
    );
});

// ── Remove member method ──────────────────────────────────────────
export const removeMember = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const org = req.organization;

    const member = org.members.find(m => 
        m.user.toString() === userId
    );

    if(!member){
        throw new ApiError(404, "Member not found");
    }

    // Owner protection
    if(userId === org.owner.toString()){
        throw new ApiError(403, "Cannot remove the organization owner");
    }

    // Prevent admin removal by non-owner
    if (member.role === "admin" && req.user._id.toString() !== org.owner.toString()) {
        throw new ApiError(403, "Only owner can remove admin");
    }

    /* // Last admin protection
    const adminCount = org.members.filter(m => m.role === "admin").length;

    if (member.role === "admin" && adminCount === 1) {
        throw new ApiError(400, "Cannot remove the last admin");
    } */

    // Remove Member
    org.members = org.members.filter(
        m => m.user.toString() !== userId
    );
    
    await org.save();

    return res.status(200).json(
        new ApiResponse(200, org, "Member removed successfully")
    );
});