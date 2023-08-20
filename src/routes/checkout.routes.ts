import checkoutCtrls from '~/controllers/checkout.controllers';
import { isAdmin, isAuthenticated } from '~/controllers/common.controllers';
import validate from '~/lib/ajv';
import schema from '~/schemas';
import { validateProps } from '~/lib/ajv';
/**
 * @type { Routes.default }
 */
module.exports = {
  prefix: '/checkout',
  routes: [
    {
      path: '/getSaleHistory',
      methods: {
        post: {
          middlewares: [isAuthenticated, checkoutCtrls.getSaleHistory],
        },
      },
    },
    {
      path: '/getPurchaseHistory',
      methods: {
        post: {
          middlewares: [isAuthenticated, checkoutCtrls.getPurchaseHistory],
        },
      },
    },
    {
      path: '/getProductPrice',
      methods: {
        post: {
          middlewares: [checkoutCtrls.getProductPrice],
        },
      },
    },
    {
      path: '/addCheckout',
      methods: {
        post: {
          middlewares: [checkoutCtrls.addCheckout],
        },
      },
    },
    {
      path: '/updateRoyaltyStatus',
      methods: {
        post: {
          middlewares: [
            // isAuthenticated,
            // isAdmin,
            checkoutCtrls.updateRoyaltyStatus,
          ],
        },
      },
    },
    {
      path: '/updateCheckoutStatus',
      methods: {
        post: {
          middlewares: [
            // isAuthenticated,
            checkoutCtrls.updateCheckoutStatus,
          ],
        },
      },
    },
    {
      path: '/saveShippingAddress',
      methods: {
        post: {
          middlewares: [isAuthenticated, checkoutCtrls.saveShippingAddress],
        },
      },
    },
    {
      path: '/getShippingAddress',
      methods: {
        get: {
          middlewares: [isAuthenticated, checkoutCtrls.getShippingAddress],
        },
      },
    },
    {
      path: '/checkout',
      methods: {
        post: {
          middlewares: [isAuthenticated, checkoutCtrls.checkout, checkoutCtrls.addCheckout],
        },
      },
    },
  ],
};
