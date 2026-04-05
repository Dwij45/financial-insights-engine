import mongoose, { Document, Schema, Types } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Role } from '../types/index.js'
import { getRequiredEnv } from '../config/env.js'

const JWT_SECRET = getRequiredEnv('JWT_SECRET')

export interface IUser extends Document {
    name: String,
    email: String,
    password: String,
    role: Role,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    comparePassword: (candidatePassword: string) => Promise<boolean>
    generateAuthToken: () => string
    hashPassword(password: string): Promise<string>;
}

const UserSchema : Schema<IUser> = new Schema({

    name: { type: String, required: true , maxLength :[50, 'Name cannot exceed 50 characters']},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: [6, 'Password must be at least 6 characters long'] , select: false },
    role: { type: String, enum: ['viewer', 'analyst', 'admin'], default: 'viewer' },
    isActive: { type: Boolean, default: true },
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now }
},{ timestamps: true }
)

// This method belongs to the model (User), not a specific user
UserSchema.statics.hashPassword = async function(password: string) {
    return await bcrypt.hash(password, 10)
}
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password)
}
UserSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ id: this._id, role: this.role },JWT_SECRET as string, { expiresIn: '48h' })
    return token
}

const UserModel = mongoose.model<IUser>('User', UserSchema)
export default UserModel