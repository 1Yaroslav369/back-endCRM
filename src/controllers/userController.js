import User from "../models/user";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";

export const registerUser = async (req, res, next) => {
  const { name, login, password, role } = req.body;

  const existingUser = await User.findOneByLogin(login);
  if (existingUser) {
    return next(createHttpError(409, "User with this login already exists"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.createUser(name, login, hashedPassword, role);

  res.status(201).json({ message: "User registered successfully", userId: newUser });
};
