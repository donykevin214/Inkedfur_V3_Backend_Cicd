import { isAdmin, isAuthenticated } from '~/controllers/common.controllers';
import typeCtrls from '~/controllers/type.controllers';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/type',
    routes: [
        {
            path: '/getProductTypes',
            methods: {
                get: {
                    middlewares: [
                        typeCtrls.getProductTypes
                    ],
                },
            },
        },
        {
            path: '/addType',
            methods: {
                post: {
                    middlewares: [
                        typeCtrls.addType
                    ],
                },
            },
        },
        {
            path: '/addOption',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        typeCtrls.addNewOption
                    ],
                },
            },
        },
        {
            path: '/getSize',
            methods: {
                post: {
                    middlewares: [
                        typeCtrls.getSize
                    ],
                },
            },
        },
        {
            path: '/addSize',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        isAdmin,
                        typeCtrls.addNewSize
                    ],
                },
            },
        }
    ],
};
