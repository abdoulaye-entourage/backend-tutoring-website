const express = require('express');
const router = express.Router();

const studentsOnly = require('../middleware/studentsOnly');
const studentCtrl = require('../controllers/student');
const verifyToken = require('../middleware/verifyToken');
const multerUpload = require('../middleware/multer.config');

router.get(
  '/sessions',
  verifyToken,
  studentsOnly,
  studentCtrl.getStudentSessions,
);
router.get('/profile/:id', studentCtrl.getOneProfile);
router.post(
  '/rate-tutor/:tutorId',
  verifyToken,
  multerUpload,
  studentCtrl.rateCommentTutor,
);

router.post(
  '/book-session',
  verifyToken,
  studentsOnly,
  studentCtrl.bookSession,
);
router.get(
  '/sessions/:studentId',
  verifyToken,
  studentCtrl.getStudentReservedSessions,
);
router.post(
  '/cancel-reserved-session',
  verifyToken,
  studentsOnly,
  studentCtrl.cancelReservedSession,
);
router.post(
  '/profile/:id',
  verifyToken,
  multerUpload,
  studentsOnly,
  studentCtrl.createStudentProfiles,
);
router.put(
  '/profile/:id',
  verifyToken,
  studentsOnly,
  studentCtrl.updateStudentProfile,
);

module.exports = router;
