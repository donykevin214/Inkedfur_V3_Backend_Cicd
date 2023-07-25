import cartCtrls from '~/controllers/cart.controllers';
import validate from '~/lib/ajv';
import schema from '~/schemas';
import { validateProps } from '~/lib/ajv';
import { isAuthenticated } from '~/controllers/common.controllers';

/**
 * @type { Routes.default }
 */
module.exports = {
    prefix: '/cart',
    routes: [
        {
            path: '/getCartProduct',
            methods: {
                get: {
                    middlewares: [
                        isAuthenticated,
                        cartCtrls.getCartProduct,
                    ],
                },
            },
        },
        {
            path: '/addCartProduct',
            methods: {
                post: {
                    middlewares: [
                        validate({ schema: schema.addCartProduct } as validateProps),
                        cartCtrls.addCartProduct,
                        cartCtrls.getCartProduct,
                    ],
                },
            },
        },
        {
            path: '/changeProductQuantity',
            methods: {
                post: {
                    middlewares: [
                        validate({ schema: schema.changeCartProductQuantity } as validateProps),
                        cartCtrls.changeProductQuantity
                    ],
                },
            },
        },
        {
            path: '/deleteCartProduct',
            methods: {
                post: {
                    middlewares: [
                        validate({ schema: schema.findByCardId } as validateProps),
                        cartCtrls.deleteCartProduct
                    ],
                },
            },
        }
    ],
};
