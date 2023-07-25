import categoryCtrls from '~/controllers/category.controllers';
import { isAuthenticated } from '~/controllers/common.controllers';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/category',
    routes: [
        {
            path: '/getAllCategories',
            methods: {
                get: {
                    middlewares: [
                        categoryCtrls.getAllCategories
                    ],
                },
            },
        },
        {
            path: '/addCategory',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        categoryCtrls.addCategory  
                    ],
                },
            },
        },
        {
            path: '/updateCategory',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        categoryCtrls.updateCategory
                    ],
                },
            },
        },
        {
            path: '/deleteCategory',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        categoryCtrls.deleteCategory 
                    ],
                },
            },
        }
    ],
};
