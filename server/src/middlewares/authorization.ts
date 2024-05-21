import jwt, { VerifyErrors } from "jsonwebtoken"
import STATUS from "../utils/status"
import { NextFunction, Request, Response } from "express"
import UserModel from "../models/User.Schema";

interface PayloadToken {
  id: any;
  email: string;
  is_admin: boolean;
}

const authorization = async (req: Request, res: Response,next:NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[0]
        
        if (!token) {
            return res.status(STATUS.AUTHENTICATOR).json({
                message:"Bạn chưa đăng nhập"
            })

        }

        jwt.verify(token, process.env.SECRET_ACCESSTOKEN!,async (err:VerifyErrors | null, data?:object | string) => {
            if (!err) {
                return res.status(STATUS.AUTHENTICATOR).json({
                    message:"Token đã hết hạn mời bạn đăng nhập lại"
                })
            }

            const existingUser = await UserModel.findById((data as PayloadToken).id)

            if (!existingUser) { 
                return res.status(STATUS.AUTHENTICATOR).json({
                    message:"Tài khoản không thỏa mãn"
                })
            }

            if (!existingUser?.is_admin) {
              return res.status(STATUS.AUTHORIZED).json({
                message: "Bạn không có quyền",
              });
            }

            next()
        });
    } catch (error:any) {
        return res.status(STATUS.INTERNAL).json({
            message: error.message
        })
    }
}