import rejectionCtrls from '~/controllers/rejection.controllers';
import { isAdmin, isAuthenticated } from '~/controllers/common.controllers';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/rejection',
    routes: [
        {
            path: '/getRejection',
            methods: {
                get: {
                    middlewares: [
                        rejectionCtrls.getRejection
                    ],
                },
            },
        },
        {
            path: '/addRejection',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        rejectionCtrls.addRejection
                    ],
                },
            },
        },
        {
            path: '/updateRejection',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        rejectionCtrls.updateRejection
                    ],
                },
            },
        },
        {
            path: '/deleteRejection',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        rejectionCtrls.deleteRejection
                    ],
                },
            },
        }
    ],
};
