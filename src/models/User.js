import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name : {
        type: String, 
        required: [true, "Name required"],
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required: [true, "Password required"],
        minlength: 6
    },
    refreshToken: {
        type: String,
        default: null
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {timestamps: true});

// Hash password method
userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;   
    this.password = await bcrypt.hash(this.password,12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword){
    return bcrypt.compare(candidatePassword, this.password);
}

// Remove sensitive fields from response
userSchema.methods.toJSON = function(){
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    return obj;
}

const User = mongoose.model("User", userSchema);

export default User;