import { isAdmin, isAuthenticated, isCreator } from '~/controllers/common.controllers';
import productCtrls from '~/controllers/product.controllers';
import validate from '~/lib/ajv';
import schema from '~/schemas';
import { validateProps } from '~/lib/ajv';
/**
 * @type { Routes.default }
 */
module.exports = {
  prefix: '/product',
  routes: [
    {
      path: '/getProductById',
      methods: {
        get: {
          middlewares: [productCtrls.getProductById],
        },
      },
    },
    {
      path: '/getAllProduct',
      methods: {
        get: {
          middlewares: [productCtrls.getAllProduct],
        },
      },
    },
    {
      path: '/getProductsCount',
      methods: {
        get: {
          middlewares: [productCtrls.getProductsCount],
        },
      },
    },
    {
      path: '/getProductsCountByUser',
      methods: {
        post: {
          middlewares: [productCtrls.getProductsCountByUser],
        },
      },
    },
    {
      path: '/getProductByUserId',
      methods: {
        post: {
          middlewares: [
            // validate({ schema: schema.findByUserId} as validateProps),
            productCtrls.getProductByUserId,
          ],
        },
      },
    },
    {
      path: '/getProductForIndex',
      methods: {
        get: {
          middlewares: [productCtrls.getProductForIndex],
        },
      },
    },
    {
      path: '/getProductByUser',
      methods: {
        post: {
          middlewares: [productCtrls.getProductByUser],
        },
      },
    },
    {
      path: '/getProductByCategory',
      methods: {
        post: {
          middlewares: [productCtrls.getProductByCategory],
        },
      },
    },
    {
      path: '/uploadPortfolioImage',
      methods: {
        post: {
          middlewares: [productCtrls.uploadPortfolioImage],
        },
      },
    },
    {
      path: '/addMultiProducts',
      methods: {
        post: {
          middlewares: [
            // validate({schema: schema.findByUserId} as validateProps),
            // isAuthenticated,
            productCtrls.addMultiProducts,
          ],
        },
      },
    },
    {
      path: '/addProduct',
      methods: {
        post: {
          middlewares: [
            // validate({ schema: schema.addProduct } as validateProps),
            // isAuthenticated,
            productCtrls.addProduct,
          ],
        },
      },
    },
    {
      path: '/deleteProduct',
      methods: {
        post: {
          middlewares: [
            // validate({ schema: schema.addProduct } as validateProps),
            isAuthenticated,
            productCtrls.deleteProduct,
          ],
        },
      },
    },
    {
      path: '/addCSVProduct',
      methods: {
        post: {
          middlewares: [
            // validate({ schema: schema.addProduct } as validateProps),
            // isAuthenticated,
            productCtrls.addCSVProduct,
          ],
        },
      },
    },
    {
      path: '/arrangeCSVProducts',
      methods: {
        post: {
          middlewares: [
            // validate({ schema: schema.addProduct } as validateProps),
            isAuthenticated,
            productCtrls.arrangeCSVProducts,
          ],
        },
      },
    },
    {
      path: '/updateTypeCrops',
      methods: {
        post: {
          middlewares: [
            // validate({ schema: schema.addProduct } as validateProps),
            isAuthenticated,
            productCtrls.updateTypeCrops,
          ],
        },
      },
    },
    {
      path: '/cropProduct',
      methods: {
        post: {
          middlewares: [
            // validate({ schema: schema.cropProduct } as validateProps),
            isAuthenticated,
            // isCreator,
            productCtrls.cropProduct,
          ],
        },
      },
    },
    {
      path: '/approveProduct',
      methods: {
        post: {
          middlewares: [
            validate({ schema: schema.findProductById } as validateProps),
            isAuthenticated,
            isAdmin,
            productCtrls.approveProduct,
          ],
        },
      },
    },
    {
      path: '/updateProductByCreator',
      methods: {
        post: {
          middlewares: [
            // isAuthenticated,
            productCtrls.updateProductByCreator,
          ],
        },
      },
    },
    {
      path: '/setProductProperity',
      methods: {
        get: {
          middlewares: [productCtrls.setProductProperity],
        },
      },
    },
    {
      path: '/setPrintsProperity',
      methods: {
        post: {
          middlewares: [productCtrls.setPrintsProperity],
        },
      },
    },
    {
      path: '/deleteProduct',
      methods: {
        post: {
          middlewares: [
            validate({ schema: schema.findProductById } as validateProps),
            isAuthenticated,
            productCtrls.deleteProduct,
          ],
        },
      },
    },
  ],
};
