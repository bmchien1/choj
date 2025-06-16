import { AdminCourseDetail, SubmissionContest, SubmissionCourse, TeacherContestView, TeacherCourseListPage, TeacherJoinCoursesPage, TeacherMatrixListPage, TeacherQuestionListPage, TeacherTagListPage } from '@/pages';
import { ContestDetail } from '@/pages/ContestDetail';
  
  const teacherRoutes = {
  
    listTeacherCourse: {
      path: '/teacher/my-courses',
      component: TeacherCourseListPage
    },
   
    listTeacherMatrix: {
      path: '/teacher/my-matrices',
      component: TeacherMatrixListPage
    },
  
    listTeacherQuestion: {
      path: '/teacher/my-questions',
      component: TeacherQuestionListPage
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