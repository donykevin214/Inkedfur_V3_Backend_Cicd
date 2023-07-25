import { isAuthenticated } from '~/controllers/common.controllers';
import wishlistCtrls from '~/controllers/wishlist.controllers';
import validate from '~/lib/ajv';
import schema from '~/schemas';
import { validateProps } from '~/lib/ajv';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/wishlist',
    routes: [
        {
            path: '/getAllWishlist',
            methods: {
                post: {
                    middlewares: [
                        wishlistCtrls.getAllWishlist
                    ],
                },
            },
        },
        {
            path: '/getWishlist',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        wishlistCtrls.getWishlist
                    ],
                },
            },
        },
        {
            path: '/addWishlist',
            methods: {
                post: {
                    middlewares: [
                        validate({ schema: schema.addWishlist } as validateProps),
                        isAuthenticated,
                        wishlistCtrls.addWishlist
                    ],
                },
            },
        },
        {
            path: '/deleteWishlist',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        wishlistCtrls.deleteWishlist
                    ],
                },
            },
        },
        {
            path: '/deleteWishlistByProduct',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        wishlistCtrls.deleteWishlistByProduct
                    ],
                },
            },
        }
    ],
};
