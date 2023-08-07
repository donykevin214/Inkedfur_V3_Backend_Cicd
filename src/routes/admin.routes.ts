import adminCtrls from '~/controllers/admin.controllers';
import { isAdmin, isAuthenticated } from '~/controllers/common.controllers';
/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/admin',
    routes: [
        {
            path: '/getCreatorApplication',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        adminCtrls.getCreatorApplication
                    ],
                },
            },
        },
        {
            path: '/getApplicationById',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        adminCtrls.getApplicationById
                    ],
                },
            },
        },
        {
            path: '/getCreatorsByStatus',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        adminCtrls.getCreatorsByStatus
                    ],
                },
            },
        },
        {
            path: '/getCustomers',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        adminCtrls.getCustomers
                    ],
                },
            },
        },
        {
            path: '/getSubmission',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        adminCtrls.getSubmission
                    ],
                },
            },
        },
        {
            path: '/getAllCreators',
            methods: {
                get: {
                    middlewares: [
                        adminCtrls.getAllCreators
                    ],
                },
            },
        },
        {
            path: '/getAgreement',
            methods: {
                post: {
                    middlewares: [
                        adminCtrls.getAgreement
                    ],
                },
            },
        },
        {
            path: '/addAgreement',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        adminCtrls.addAgreement
                    ],
                },
            },
        },
        {
            path: '/getAllOrder',
            methods: {
                post: {
                    middlewares: [
                        adminCtrls.getAllOrder
                    ],
                },
            },
        },
        {
            path: '/getTotalStatistic',
            methods: {
                post: {
                    middlewares: [
                        adminCtrls.getTotalStatistic
                    ],
                },
            },
        }
    ],
};
