import { isAuthenticated } from '~/controllers/common.controllers';
import supportCtrls from '~/controllers/support.controllers';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/support',
    routes: [
        {
            path: '/getSupportByUser',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        supportCtrls.getSupportByUser
                    ],
                },
            },
        },
        {
            path: '/getOrderData',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        supportCtrls.getOrderData
                    ],
                },
            },
        }
    ],
};
