import ApiError from "../utils/ApiError.js";
import Organization from "../models/Organization.js";

// Check user role withing an organization
const requireRole = (...roles) => async (req, res, next) => {
    try{
        const orgId = req.params.orgId || req.body.orgId;
        const org = await Organization.findOne({_id: orgId, isDeleted: false});
        if(!org) throw new ApiError(404, "Organization not found");

        const member = org.members.find(
            m => m.user.toString() === req.user._id.toString()
        );

        if(!member) throw new ApiError(403, "Not a member of this organization");
        if(!roles.includes(member.role)) throw new ApiError(403, `Requires role: ${roles.join(" or ")}`);

        req.userRole = member.role;
        req.organization = org;
        next();
    }
    catch(err){
        next(err);
    }
}

export default requireRole;