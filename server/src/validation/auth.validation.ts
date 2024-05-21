import Joi from "joi";

export const loginFormValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Bạn chưa nhập email",
    "string.email": "Email không đúng định dạng",
  }),
  password: Joi.string().required().messages({
    "any.required": "Bạn chưa nhập password",
    "string.min": "Mật khẩu phải trên 6 kí tự",
  }),
});

export const registerForm = Joi.object({
  userName: Joi.string().required().messages({
    "any.required": "Bạn chưa nhập tên đăng nhập",
  }),
  password: Joi.string().required().min(6).messages({
    "any.required": "Bạn chưa nhập mật khẩu",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Bạn chưa nhập email",
    "string.email": "Email không đúng định dạng",
  }),
  forgotPassword: Joi.string().required().messages({
    "any.required": "Bạn chưa nhập nhập lại mật khẩu",
  }),
});
