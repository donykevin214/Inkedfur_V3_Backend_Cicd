import { isAuthenticated } from '~/controllers/common.controllers';
import wishlistgroupCtrls from '~/controllers/wishlistgroup.controllers';
import validate from '~/lib/ajv';
import schema from '~/schemas';
import { validateProps } from '~/lib/ajv';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/wishlistgroup',
    routes: [
        {
            path: '/getWishlistGroup',
            methods: {
                get: {
                    middlewares: [
                        // validate({schema: schema.findByUserId, type: 'query'} as validateProps), 
                        isAuthenticated,
                        wishlistgroupCtrls.getWishlistGroup
                    ],
                },
            },
        },
        {
            path: '/addWishlistGroup',
            methods: {
                post: {
                    middlewares: [
                        validate({schema: schema.addWishlistGroup} as validateProps), 
                        isAuthenticated,
                        wishlistgroupCtrls.addWishlistGroup
                    ],
                },
            },
        },
        {
            path: '/updateWishlistGroup',
            methods: {
                post: {
                    middlewares: [
                        validate({schema: schema.updateWishlistGroup} as validateProps), 
                        // isAuthenticated,
                        wishlistgroupCtrls.updateWishlistGroup,    
                    ],
                },
            },
        },
        {
            path: '/deleteWishlistGroup',
            methods: {
                post: {
                    middlewares: [
                        validate({schema: schema.deleteWishlistGroup} as validateProps), 
                        isAuthenticated,
                        wishlistgroupCtrls.deleteWishlistGroup
                    ],
                },
            },
        }
    ],
};
