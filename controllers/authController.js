// controllers/authController.js
import crypto from "crypto";
import { UserModel } from "../models/userModel.js";
import { hashPassword, verifyPassword } from "../utils/passwords.js";

export const registerPage = (req, res) => {
  res.render("register", { title: "Register" });
};

export const loginPage = (req, res) => {
  res.render("login", { title: "Login" });
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || !name.trim()) errors.push("Name is required.");
    if (!email || !email.trim()) errors.push("Email is required.");
    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters.");
    }

    if (errors.length) {
      return res.status(400).render("register", {
        title: "Register",
        errors,
        form: { name, email }
      });
    }

    const existing = await UserModel.findByEmail(email.trim().toLowerCase());
    if (existing) {
      return res.status(400).render("register", {
        title: "Register",
        errors: ["An account with that email already exists."],
        form: { name, email }
      });
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: "student"
    });

    const sessionToken = crypto.randomUUID();
    await UserModel.setSession(user._id, sessionToken);

    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail((email || "").trim().toLowerCase());

    if (!user || !verifyPassword(password || "", user.passwordHash)) {
      return res.status(400).render("login", {
        title: "Login",
        errors: ["Invalid email or password."],
        form: { email }
      });
    }

    const sessionToken = crypto.randomUUID();
    await UserModel.setSession(user._id, sessionToken);

    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    if (req.user) {
      await UserModel.clearSession(req.user._id);
    }

    res.clearCookie("sessionToken");
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};