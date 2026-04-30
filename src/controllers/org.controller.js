import Organization from "../models/Organization.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {generateAccessToken, generateRefreshToken, cookieOptions} from "../utils/generateTokens.js";
import crypto from "crypto";

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