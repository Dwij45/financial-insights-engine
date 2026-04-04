import UserModel from "../models/user.model.js";
import type { RegisterDto } from "../types/index.js";

const findUserByEmail = async (email: string, role:,includePassword = false): Promise<any> => {
    const query = UserModel.findOne({ email })
    if (includePassword) {
        query.select('+password')
    }
    return await query
}

const createUser = async (userData: RegisterDto) => {
if (!userData.name || !userData.email || !userData.password || !userData.role) {
    throw new Error('Name, email, password and role are required.')
  }
  const user = await UserModel.create(userData)
  return user
}
export const UserService = {
    createUser,
    findUserByEmail
}