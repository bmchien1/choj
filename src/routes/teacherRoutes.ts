import { AdminCourseDetail, CreateCoursePage, CreateMatrixPage, CreateQuestionPage, CreateTagPage, HomePage, SubmissionContest, SubmissionCourse, TeacherContestView, TeacherCourseListPage, TeacherJoinCoursesPage, TeacherMatrixListPage, TeacherQuestionListPage, TeacherTagListPage, UserListPage } from '@/pages';
import { ContestDetail } from '@/pages/ContestDetail';
  
  const teacherRoutes = {
    createCourse: {
      path: '/teacher/course/create',
      component: CreateCoursePage
    },
    listTeacherCourse: {
      path: '/teacher/my-courses',
      component: TeacherCourseListPage
    },
    createMatrix: {
      path: '/teacher/matrix/create',
      component: CreateMatrixPage
    },
    listTeacherMatrix: {
      path: '/teacher/my-matrices',
      component: TeacherMatrixListPage
    },
    createQuestion: {
      path: '/teacher/question/create',
      component: CreateQuestionPage
    },
    listTeacherQuestion: {
      path: '/teacher/my-questions',
      component: TeacherQuestionListPage
    },
    createTag: {
      path: '/teacher/tag/create',
      component: CreateTagPage
    },
    listTeacherTag: {
      path: '/teacher/my-tags',
      component: TeacherTagListPage
    },
    joinCourse:{
      path: '/teacher/join-course-request',
      component: TeacherJoinCoursesPage
    },
    courseDetail: {
      path: '/teacher/courses/details/:id',
      component: AdminCourseDetail
    },
    contest:{
      path: '/teacher/contest',
      component: TeacherContestView
    },
    contestDetail: {
      path: '/contests/:id',
      component: ContestDetail
    },
    submissionCourse:{
      path: '/teacher/submission/course/:courseId',
      component: SubmissionCourse
    },
    submissionContest:{
      path: '/teacher/submission/contest/:contestId',
      component: SubmissionContest
    }
  };
  
  export default teacherRoutes;