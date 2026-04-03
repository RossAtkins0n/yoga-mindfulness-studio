// middlewares/auth.js
import { UserModel } from "../models/userModel.js";

export const attachCurrentUser = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.sessionToken;

    if (!sessionToken) {
      req.user = null;
      res.locals.user = null;
      return next();
    }

    const user = await UserModel.findBySessionToken(sessionToken);

    req.user = user || null;
    res.locals.user = user
        ? { ...user, isOrganiser: user.role === "organiser" }
         : null;

    next();
  } catch (err) {
    next(err);
  }
};

export const requireLogin = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};

export const requireOrganiser = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  if (req.user.role !== "organiser") {
    return res
      .status(403)
      .render("error", { title: "Forbidden", message: "Organiser access only." });
  }

  next();
};