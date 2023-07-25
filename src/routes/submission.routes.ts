import submissionCtrls from '~/controllers/submission.controllers';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/submission',
    routes: [
        {
            path: '/getSubmissionByUserId',
            methods: {
                get: {
                    middlewares: [
                        submissionCtrls.getSubmissionByUserId
                    ],
                },
            },
        },
        {
            path: '/addSubmission',
            methods: {
                post: {
                    middlewares: [
                        submissionCtrls.addSubmission
                    ],
                },
            },
        },
        {
            path: '/updateSubmissionById',
            methods: {
                post: {
                    middlewares: [
                        submissionCtrls.updateSubmissionById
                    ],
                },
            },
        },
        {
            path: '/deleteSubmissionById',
            methods: {
                post: {
                    middlewares: [
                        submissionCtrls.deleteSubmissionById
                    ],
                },
            },
        }
    ],
};
