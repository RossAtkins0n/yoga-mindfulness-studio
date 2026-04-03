import { Router } from "express";
import {
  adminDashboardPage,
  adminCoursesPage,
  adminNewCoursePage,
  adminCreateCourse,
  adminEditCoursePage,
  adminUpdateCourse,
  adminDeleteCourse,
  adminSessionsPage,
  adminNewSessionPage,
  adminCreateSession,
  adminEditSessionPage,
  adminUpdateSession,
  adminDeleteSession,
  adminSessionParticipantsPage,
  adminUsersPage,
  adminPromoteUser,
  adminDemoteUser,
  adminDeleteUser,
} from "../controllers/adminController.js";
import { requireOrganiser } from "../middlewares/auth.js";

const router = Router();

router.use(requireOrganiser);

router.get("/", adminDashboardPage);

router.get("/courses", adminCoursesPage);
router.get("/courses/new", adminNewCoursePage);
router.post("/courses/new", adminCreateCourse);
router.get("/courses/:id/edit", adminEditCoursePage);
router.post("/courses/:id/edit", adminUpdateCourse);
router.post("/courses/:id/delete", adminDeleteCourse);
router.get("/courses/:courseId/sessions", adminSessionsPage);
router.get("/courses/:courseId/sessions/new", adminNewSessionPage);
router.post("/courses/:courseId/sessions/new", adminCreateSession);

router.get("/sessions/:sessionId/edit", adminEditSessionPage);
router.post("/sessions/:sessionId/edit", adminUpdateSession);
router.post("/sessions/:sessionId/delete", adminDeleteSession);
router.get("/sessions/:sessionId/participants", adminSessionParticipantsPage);
router.get("/users", adminUsersPage);
router.post("/users/:userId/promote", adminPromoteUser);
router.post("/users/:userId/demote", adminDemoteUser);
router.post("/users/:userId/delete", adminDeleteUser);

export default router;