import type{ Request, Response } from "express";
import type {RegisterDto} from "../types/index.js";
import UserModel from "../models/user.model.js"
import { UserService } from "../services/auth.services.js";

// register controller for ADMIN to create users with specific roles
const register = async (req: Request, res: Response) => {
    const {name , email , password, role }  = req.body

    if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Name, email ,role and password are required.'
    })
  }
  // @ts-ignore
    const hashedPassword = await UserModel.hashPassword(password)
    const existingUser = await UserService.findUserByEmail(email,true)
    console.log(existingUser)
    if(existingUser) {
        return res.status(400).json({
            success: false,message: 'Email already in use.'
        })
    };

  const User = await UserService.createUser({
    name,email,password: hashedPassword,role
  })
  const token = User.generateAuthToken()
  
  return res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: {
      token,
      user: {
        id: User._id,name: User.name,email: User.email,role: User.role
      }
  }
  })
};

// login controller is for all users to login and get token
const login = async (req: Request, res: Response) => {

    const { email, password , role} = req.body
    if (!email || !password ) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.'
        })
    }
    const User = await UserService.findUserByEmail(email, true)
    if (!User) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email or password.'
        })
    }
    const isMatch = await User.comparePassword(password)
    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email or password.'
        })
    }
    if (!User.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated. Contact administrator.'
      })
    }
    const token = User.generateAuthToken()

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: User._id,name: User.name,email: User.email,role: User.role
        }
      }
    })

}

export const authController = {
    register,
    login
}