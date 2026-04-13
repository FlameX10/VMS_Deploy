import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET;

export const generateToken = (user) => {
  const resolvedUserId = user?._id || user?.id || user?.user_id;
  if (!resolvedUserId) {
    throw new Error("Unable to generate token: missing user id");
  }

  return jwt.sign(
    {
      id: String(resolvedUserId),
      email: user.email,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "1d" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};
