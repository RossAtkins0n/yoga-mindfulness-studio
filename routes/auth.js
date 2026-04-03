// routes/auth.js
import { Router } from "express";
import {
  loginPage,
  logoutUser,
  registerPage,
  registerUser,
  loginUser
} from "../controllers/authController.js";
import { requireLogin } from "../middlewares/auth.js";

const router = Router();

router.get("/register", registerPage);
router.post("/register", registerUser);

router.get("/login", loginPage);
router.post("/login", loginUser);

router.post("/logout", requireLogin, logoutUser);

export default router;