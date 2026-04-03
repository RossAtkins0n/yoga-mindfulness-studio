import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { UserModel } from "../models/userModel.js";
import { BookingModel } from "../models/bookingModel.js";

const fmtDateOnly = (iso) =>
  iso
    ? new Date(iso).toISOString().split("T")[0]
    : "";

export const adminDashboardPage = async (req, res, next) => {
  try {
    res.render("admin_dashboard", {
      title: "Admin Dashboard",
    });
  } catch (err) {
    next(err);
  }
};

export const adminCoursesPage = async (req, res, next) => {
  try {
    const courses = await CourseModel.list();

    res.render("admin_courses", {
      title: "Manage Courses",
      courses: courses.map((c) => ({
        id: c._id,
        title: c.title,
        level: c.level,
        type: c.type,
        startDate: fmtDateOnly(c.startDate),
        endDate: fmtDateOnly(c.endDate),
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const adminNewCoursePage = (req, res) => {
  res.render("admin_course_form", {
    title: "New Course",
    formTitle: "Add New Course",
    action: "/admin/courses/new",
    course: {
      levelBeginner: true,
      typeWeekly: true,
      dropInNo: true,
    },
  });
};

export const adminCreateCourse = async (req, res, next) => {
  try {
    const { title, description, location, price, level, type, startDate, endDate, allowDropIn } = req.body;
    const errors = [];

    if (!title || !title.trim()) errors.push("Title is required.");
    if (!description || !description.trim()) errors.push("Description is required.");
    if (!location || !location.trim()) errors.push("Location is required.");

    const priceNum = Number(price);
    if (price === undefined || price === "" || Number.isNaN(priceNum) || priceNum < 0) {
     errors.push("Price must be 0 or more.");
}
    if (!["beginner", "intermediate", "advanced"].includes(level)) {
      errors.push("Level is invalid.");
    }
    if (!["WEEKLY_BLOCK", "WEEKEND_WORKSHOP"].includes(type)) {
      errors.push("Type is invalid.");
    }
    if (!startDate) errors.push("Start date is required.");
    if (!endDate) errors.push("End date is required.");
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push("End date must be on or after the start date.");
    }

    if (errors.length) {
      return res.status(400).render("admin_course_form", {
        title: "New Course",
        formTitle: "Add New Course",
        action: "/admin/courses/new",
        errors,
        course: {
          title,
          description,
          location,
          price,
          levelBeginner: level === "beginner",
          levelIntermediate: level === "intermediate",
          levelAdvanced: level === "advanced",
          typeWeekly: type === "WEEKLY_BLOCK",
          typeWorkshop: type === "WEEKEND_WORKSHOP",
          startDate,
          endDate,
          dropInYes: allowDropIn === "true",
          dropInNo: allowDropIn !== "true",
        },
      });
    }

    await CourseModel.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      price: priceNum,
      level,
      type,
      startDate,
      endDate,
      allowDropIn: allowDropIn === "true",
    });

    res.redirect("/admin/courses");
  } catch (err) {
    next(err);
  }
};

export const adminEditCoursePage = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Course not found",
      });
    }

    res.render("admin_course_form", {
      title: "Edit Course",
      formTitle: "Edit Course",
      action: `/admin/courses/${course._id}/edit`,
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        location: course.location,
        price: course.price,
        levelBeginner: course.level === "beginner",
        levelIntermediate: course.level === "intermediate",
        levelAdvanced: course.level === "advanced",
        typeWeekly: course.type === "WEEKLY_BLOCK",
        typeWorkshop: course.type === "WEEKEND_WORKSHOP",
        startDate: fmtDateOnly(course.startDate),
        endDate: fmtDateOnly(course.endDate),
        dropInYes: course.allowDropIn === true,
        dropInNo: course.allowDropIn === false,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateCourse = async (req, res, next) => {
  try {
    const { title, description, location, price, level, type, startDate, endDate, allowDropIn } = req.body;
    const errors = [];

    if (!title || !title.trim()) errors.push("Title is required.");
    if (!description || !description.trim()) errors.push("Description is required.");
    if (!location || !location.trim()) errors.push("Location is required.");
    const priceNum = Number(price);
    if (price === undefined || price === "" || Number.isNaN(priceNum) || priceNum < 0) {
      errors.push("Price must be 0 or more.");
    }
    if (!["beginner", "intermediate", "advanced"].includes(level)) {
      errors.push("Level is invalid.");
    }
    if (!["WEEKLY_BLOCK", "WEEKEND_WORKSHOP"].includes(type)) {
      errors.push("Type is invalid.");
    }
    if (!startDate) errors.push("Start date is required.");
    if (!endDate) errors.push("End date is required.");
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push("End date must be on or after the start date.");
    }

    if (errors.length) {
      return res.status(400).render("admin_course_form", {
        title: "Edit Course",
        formTitle: "Edit Course",
        action: `/admin/courses/${req.params.id}/edit`,
        errors,
        course: {
          title,
          description,
          location,
          price,
          levelBeginner: level === "beginner",
          levelIntermediate: level === "intermediate",
          levelAdvanced: level === "advanced",
          typeWeekly: type === "WEEKLY_BLOCK",
          typeWorkshop: type === "WEEKEND_WORKSHOP",
          startDate,
          endDate,
          dropInYes: allowDropIn === "true",
          dropInNo: allowDropIn !== "true",
        },
      });
    }

   await CourseModel.update(req.params.id, {
     title: title.trim(),
     description: description.trim(),
     location: location.trim(),
     price: priceNum,
     level,
     type,
     startDate,
     endDate,
     allowDropIn: allowDropIn === "true",
});

    res.redirect("/admin/courses");
  } catch (err) {
    next(err);
  }
};

export const adminDeleteCourse = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Course not found",
      });
    }

    const sessions = await SessionModel.listByCourse(course._id);

    for (const session of sessions) {
      await SessionModel.delete(session._id);
    }

    await CourseModel.delete(course._id);

    res.redirect("/admin/courses");
  } catch (err) {
    next(err);
  }
};

const fmtDateTimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const adminSessionsPage = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.courseId);

    if (!course) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Course not found",
      });
    }

    const sessions = await SessionModel.listByCourse(course._id);

    res.render("admin_sessions", {
      title: "Manage Sessions",
      course: {
        id: course._id,
        title: course.title,
      },
      sessions: sessions.map((s) => ({
        id: s._id,
        startDateTime: s.startDateTime,
        endDateTime: s.endDateTime,
        capacity: s.capacity,
        bookedCount: s.bookedCount ?? 0,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const adminNewSessionPage = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.courseId);

    if (!course) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Course not found",
      });
    }

    res.render("admin_session_form", {
      title: "Add Session",
      formTitle: `Add Session for ${course.title}`,
      action: `/admin/courses/${course._id}/sessions/new`,
      course: {
        id: course._id,
        title: course.title,
      },
      session: {},
    });
  } catch (err) {
    next(err);
  }
};

export const adminCreateSession = async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.courseId);

    if (!course) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Course not found",
      });
    }

    const { startDateTime, endDateTime, capacity } = req.body;
    const errors = [];

    if (!startDateTime) errors.push("Start date and time is required.");
    if (!endDateTime) errors.push("End date and time is required.");

    const capacityNum = Number(capacity);
    if (!capacity || Number.isNaN(capacityNum) || capacityNum < 1) {
      errors.push("Capacity must be at least 1.");
    }

    if (
      startDateTime &&
      endDateTime &&
      new Date(startDateTime) >= new Date(endDateTime)
    ) {
      errors.push("End date and time must be after the start date and time.");
    }

    if (errors.length) {
      return res.status(400).render("admin_session_form", {
        title: "Add Session",
        formTitle: `Add Session for ${course.title}`,
        action: `/admin/courses/${course._id}/sessions/new`,
        course: {
          id: course._id,
          title: course.title,
        },
        errors,
        session: {
          startDateTime,
          endDateTime,
          capacity,
        },
      });
    }

    await SessionModel.create({
      courseId: course._id,
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: new Date(endDateTime).toISOString(),
      capacity: capacityNum,
      bookedCount: 0,
    });

    res.redirect(`/admin/courses/${course._id}/sessions`);
  } catch (err) {
    next(err);
  }
};

export const adminEditSessionPage = async (req, res, next) => {
  try {
    const session = await SessionModel.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Session not found",
      });
    }

    const course = await CourseModel.findById(session.courseId);

    res.render("admin_session_form", {
      title: "Edit Session",
      formTitle: `Edit Session for ${course?.title || "Course"}`,
      action: `/admin/sessions/${session._id}/edit`,
      course: {
        id: course?._id,
        title: course?.title,
      },
      session: {
        id: session._id,
        startDateTime: fmtDateTimeLocal(session.startDateTime),
        endDateTime: fmtDateTimeLocal(session.endDateTime),
        capacity: session.capacity,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateSession = async (req, res, next) => {
  try {
    const session = await SessionModel.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Session not found",
      });
    }

    const course = await CourseModel.findById(session.courseId);
    const { startDateTime, endDateTime, capacity } = req.body;
    const errors = [];

    if (!startDateTime) errors.push("Start date and time is required.");
    if (!endDateTime) errors.push("End date and time is required.");

    const capacityNum = Number(capacity);
    if (!capacity || Number.isNaN(capacityNum) || capacityNum < 1) {
      errors.push("Capacity must be at least 1.");
    }

    if (
      startDateTime &&
      endDateTime &&
      new Date(startDateTime) >= new Date(endDateTime)
    ) {
      errors.push("End date and time must be after the start date and time.");
    }

    if (errors.length) {
      return res.status(400).render("admin_session_form", {
        title: "Edit Session",
        formTitle: `Edit Session for ${course?.title || "Course"}`,
        action: `/admin/sessions/${session._id}/edit`,
        course: {
          id: course?._id,
          title: course?.title,
        },
        errors,
        session: {
          id: session._id,
          startDateTime,
          endDateTime,
          capacity,
        },
      });
    }

    await SessionModel.update(session._id, {
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: new Date(endDateTime).toISOString(),
      capacity: capacityNum,
    });

    res.redirect(`/admin/courses/${session.courseId}/sessions`);
  } catch (err) {
    next(err);
  }
};

export const adminDeleteSession = async (req, res, next) => {
  try {
    const session = await SessionModel.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Session not found",
      });
    }

    const courseId = session.courseId;
    await SessionModel.delete(session._id);

    res.redirect(`/admin/courses/${courseId}/sessions`);
  } catch (err) {
    next(err);
  }
};

export const adminSessionParticipantsPage = async (req, res, next) => {
  try {
    const session = await SessionModel.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "Session not found",
      });
    }

    const course = await CourseModel.findById(session.courseId);
    const bookings = await BookingModel.listBySession(session._id);

    const participants = await Promise.all(
      bookings.map(async (booking) => {
        const user = await UserModel.findById(booking.userId);

        return {
          name: user?.name || "Unknown user",
          email: user?.email || "",
          bookingId: booking._id,
          bookedAt: booking.createdAt || "",
          type: booking.type,
        };
      })
    );

    res.render("admin_session_participants", {
      title: "Session Participants",
      course: {
        id: course?._id,
        title: course?.title || "Unknown course",
      },
      session: {
        id: session._id,
        startDateTime: session.startDateTime,
        endDateTime: session.endDateTime,
        capacity: session.capacity,
        bookedCount: session.bookedCount ?? 0,
      },
      participants,
    });
  } catch (err) {
    next(err);
  }
};

export const adminUsersPage = async (req, res, next) => {
  try {
    const users = await UserModel.list();

    res.render("admin_users", {
      title: "Manage Users",
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role || "student",
        isOrganiser: u.role === "organiser",
        isCurrentUser: req.user && req.user._id === u._id,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const adminPromoteUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "User not found",
      });
    }

    await UserModel.update(user._id, { role: "organiser" });
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
};

export const adminDemoteUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "User not found",
      });
    }

    if (req.user && req.user._id === user._id) {
      return res.status(400).render("error", {
        title: "Action not allowed",
        message: "You cannot demote your own organiser account.",
      });
    }

    await UserModel.update(user._id, { role: "student" });
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).render("error", {
        title: "Not found",
        message: "User not found",
      });
    }

    if (req.user && req.user._id === user._id) {
      return res.status(400).render("error", {
        title: "Action not allowed",
        message: "You cannot delete your own account.",
      });
    }

    await UserModel.delete(user._id);
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
};