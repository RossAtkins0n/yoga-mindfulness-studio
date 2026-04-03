// services/bookingService.js
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { BookingModel } from "../models/bookingModel.js";

const canReserveAll = (sessions) =>
  sessions.every((s) => (s.bookedCount ?? 0) < (s.capacity ?? 0));

export async function bookCourseForUser(userId, courseId) {
  const course = await CourseModel.findById(courseId);
  if (!course) throw new Error("Course not found");

  const existingCourseBooking = await BookingModel.findActiveCourseBooking(
    userId,
    courseId
  );
  if (existingCourseBooking) {
    throw new Error("You have already booked this course.");
  }

  const sessions = await SessionModel.listByCourse(courseId);
  if (sessions.length === 0) throw new Error("Course has no sessions");

  const alreadyBookedSession = (
    await Promise.all(
      sessions.map((s) => BookingModel.findActiveSessionBooking(userId, s._id))
    )
  ).find(Boolean);

  if (alreadyBookedSession) {
    throw new Error(
      "You already have a booking for one of the sessions in this course."
    );
  }

  let status = "CONFIRMED";
  if (!canReserveAll(sessions)) {
    status = "WAITLISTED";
  } else {
    for (const s of sessions) {
      await SessionModel.incrementBookedCount(s._id, 1);
    }
  }

  return BookingModel.create({
    userId,
    courseId,
    type: "COURSE",
    sessionIds: sessions.map((s) => s._id),
    status,
  });
}

export async function bookSessionForUser(userId, sessionId) {
  const session = await SessionModel.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const course = await CourseModel.findById(session.courseId);
  if (!course) throw new Error("Course not found");

  const existingSessionBooking = await BookingModel.findActiveSessionBooking(
    userId,
    sessionId
  );
  if (existingSessionBooking) {
    throw new Error("You have already booked this session.");
  }

  const existingCourseBooking = await BookingModel.findActiveCourseBooking(
    userId,
    course._id
  );
  if (existingCourseBooking) {
    throw new Error("You have already booked the full course.");
  }

  if (!course.allowDropIn && course.type === "WEEKLY_BLOCK") {
    const err = new Error("Drop-in not allowed for this course");
    err.code = "DROPIN_NOT_ALLOWED";
    throw err;
  }

  let status = "CONFIRMED";
  if ((session.bookedCount ?? 0) >= (session.capacity ?? 0)) {
    status = "WAITLISTED";
  } else {
    await SessionModel.incrementBookedCount(session._id, 1);
  }

  return BookingModel.create({
    userId,
    courseId: course._id,
    type: "SESSION",
    sessionIds: [session._id],
    status,
  });
}