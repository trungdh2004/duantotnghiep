import dotenv from "dotenv";
dotenv.config();
import { NextFunction, Request, Response } from "express";
import {
  loginFormValidation,
  registerForm,
} from "../validation/auth.validation";
import STATUS from "../utils/status";
import UserModel from "../models/User.Schema";
import bcrypt from "bcrypt";
import jwt, { VerifyErrors } from "jsonwebtoken";
import RefreshTokenModel from "../models/RefreshToken";

interface PayloadToken {
  id: any;
  email: string;
  is_admin: boolean;
}

interface ResponseData extends Response {
  user?: PayloadToken;
}

class AuthController {
  async generateAccessToken(value: PayloadToken | object | string) {
    return jwt.sign(value, process.env.SECRET_ACCESSTOKEN!, {
      expiresIn: "15m",
    });
  }
  async generateRefreshToken(value: PayloadToken | object | string) {
    return jwt.sign(value, process.env.SECRET_REFRESHTOKEN!, {
      expiresIn: "60d",
    });
  }

  loginForm = async (req: Request, res: Response) => {
    try {
      const { error } = loginFormValidation.validate(req.body);

      if (error) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: error.details[0].message,
        });
      }

      const { email, password } = req.body;

      const existingEmail = await UserModel.findOne({
        email: email,
      });

      if (!existingEmail) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Email chưa được đăng kí , mời bạn đăng kí tài khoản",
        });
      }

      const isComparePass = await bcrypt.compare(
        password,
        existingEmail.password
      );

      if (!isComparePass) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Mật khẩu không đúng",
        });
      }

      const accessToken = await this.generateAccessToken({
        id: existingEmail._id,
        email: existingEmail.email,
        is_admin: existingEmail.is_admin,
      });
      const refreshToken = await this.generateRefreshToken({
        id: existingEmail._id,
        email: existingEmail.email,
        is_admin: existingEmail.is_admin,
      });

      await RefreshTokenModel.create({
        userId: existingEmail._id,
        token: refreshToken,
      });

      res.cookie("token", refreshToken, {
        maxAge: 1000 * 60 * 24 * 60,
        httpOnly: true,
        path: "/",
      });

      delete existingEmail._doc.password;

      return res.status(STATUS.OK).json({
        message: "Đăng nhập thành công",
        accessToken: accessToken,
        user: existingEmail,
      });
    } catch (error: any) {
      return res.status(STATUS.INTERNAL).json({
        message: error.message,
      });
    }
  };
  async registerForm(req: Request, res: Response) {
    try {
      const { error } = registerForm.validate(req.body);

      if (error) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: error.details[0].message,
        });
      }

      const { email, password, forgotPassword, userName } = req.body;
      

      if (password !== forgotPassword) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Nhập lại mật khẩu không trùng nhau",
        });
      }

      const existingEmail = await UserModel.findOne({
        email: email,
      });

      if (existingEmail) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Email này được đăng kí",
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);      

      const newUser = await UserModel.create({
        email,
        password: hashPassword,
        userName: userName,
        slug: `@userName`,
      });

      return res.status(STATUS.OK).json({
        message: "Đăng kí tài khoản thành công",
      });
    } catch (error: any) {
      console.log("error:",error);
      
      return res.status(STATUS.INTERNAL).json({
        message: error.message,
        error: true,
      });
    }
  }
  async socialUser(req: Request, res: Response) {
    try {
    } catch (error) {}
  }

  refreshToken = async (req: Request, res: ResponseData) => {
    try {
      const refreshToken = req.headers?.authorization?.split(" ")[0];
      if (!refreshToken) {
        return res.status(STATUS.AUTHENTICATOR).json({
          message: "Bạn chưa đăng nhập ",
        });
      }

      jwt.verify(
        refreshToken,
        process.env.SECRET_REFRESHTOKEN!,
        async (err: VerifyErrors | null, data?: object | string) => {
          if (err) {
            return res.status(STATUS.AUTHENTICATOR).json({
              message: "Token đã hết hạn mời bạn đăng nhập lại",
            });
          }
          if (!data) {
            return;
          }
          const refreshTokenDb = await RefreshTokenModel.findOne({
            userId: (data as PayloadToken).id,
            token: refreshToken,
          });

          if (!refreshTokenDb) {
            return res.status(STATUS.AUTHENTICATOR).json({
              message: "Mời bạn đăng nhập lại",
            });
          }

          const newAccessToken = this.generateAccessToken(data);
          const newRefreshToken = this.generateRefreshToken(data);

          res.cookie("refreshToken", newRefreshToken, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            path: "/",
          });

          return res.status(STATUS.OK).json({
            message: "Tạo token thành công",
            accessToken: newAccessToken,
          });
        }
      );
    } catch (error: any) {
      return res.status(STATUS.INTERNAL).json({
        message: error.message,
      });
    }
  };

  async logout(req: Request, res: Response) {
    try {
      const user = {
        id: "",
      };

      if (!user) {
        return res.status(STATUS.AUTHENTICATOR).json({
          message: "Bạn chưa đăng nhập",
        });
      }

      await RefreshTokenModel.findOneAndDelete({ userId: user.id });

      res.cookie("refreshToken", undefined, {
        maxAge: 0,
      });

      return res.status(STATUS.OK).json({
        message: "Bạn đã đăng xuất thành công",
      });
    } catch (error: any) {
      return res.status(STATUS.INTERNAL).json({
        message: error.message,
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Bạn chưa nhập email tài khoản",
        });
      }

      const existing = await UserModel.findOne({
        email: email,
      });

      if (!existing) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "Email chưa được đăng kí",
        });
      }
      
      
    } catch (error: any) {
      return res.status(STATUS.INTERNAL).json({
        message: error.message,
      });
    }
  }
}

export default new AuthController();
