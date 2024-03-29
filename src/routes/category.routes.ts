import categoryCtrls from '~/controllers/category.controllers';
import { isAdmin, isAuthenticated } from '~/controllers/common.controllers';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/category',
    routes: [
        {
            path: '/getAllCategories',
            methods: {
                post: {
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
                        isAdmin,
                        categoryCtrls.addCategory,
                        categoryCtrls.getAllCategories
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
                        isAdmin,
                        categoryCtrls.updateCategory,
                        categoryCtrls.getAllCategories
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
                        isAdmin,
                        categoryCtrls.deleteCategory,
                        categoryCtrls.getAllCategories
                    ],
                },
            },
        }
    ],
};
