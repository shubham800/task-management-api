import ApiError from "../utils/ApiError.js";
import Organization from "../models/Organization.js";

// Check user role within an organization
const requireRole = (...roles) => async (req, res, next) => {
    try{
        const orgId = req.params.orgId;
        const org = await Organization.findOne({_id: orgId, isDeleted: false});
        if(!org) throw new ApiError(404, "Organization not found");

        const isOwner = org.owner.toString() === req.user._id.toString();

        const member = org.members.find(
            m => m.user.toString() === req.user._id.toString()
        );

        if(!member && !isOwner){ 
            throw new ApiError(403, "Not a member of this organization");
        }

        if(roles.length && !roles.includes(member.role)) {
            throw new ApiError(403, `Requires role: ${roles.join(" or ")}`);
        }

        req.userRole = member.role;
        req.organization = org;
        next();
    }
    catch(err){
        next(err);
    }
}

export default requireRole;