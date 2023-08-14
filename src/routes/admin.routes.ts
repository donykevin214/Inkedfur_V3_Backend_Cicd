import adminCtrls from '~/controllers/admin.controllers';
import { isAdmin, isAuthenticated } from '~/controllers/common.controllers';
/**
 * @type { Routes.default }
 */
module.exports = {
  prefix: '/admin',
  routes: [
    {
      path: '/getCreatorApplication',
      methods: {
        post: {
          middlewares: [isAuthenticated, isAdmin, adminCtrls.getCreatorApplication],
        },
      },
    },
    {
      path: '/getApplicationById',
      methods: {
        post: {
          middlewares: [isAuthenticated, isAdmin, adminCtrls.getApplicationById],
        },
      },
    },
    {
      path: '/getCreatorsByStatus',
      methods: {
        post: {
          middlewares: [isAuthenticated, isAdmin, adminCtrls.getCreatorsByStatus],
        },
      },
    },
    {
      path: '/getCustomers',
      methods: {
        post: {
          middlewares: [isAuthenticated, isAdmin, adminCtrls.getCustomers],
        },
      },
    },
    {
      path: '/getSubmission',
      methods: {
        post: {
          middlewares: [isAuthenticated, adminCtrls.getSubmission],
        },
      },
    },
    {
      path: '/clearAsset',
      methods: {
        post: {
          middlewares: [isAuthenticated, isAdmin, adminCtrls.clearAsset],
        },
      },
    },
    {
      path: '/resizeImage',
      methods: {
        post: {
          middlewares: [adminCtrls.resizeImage],
        },
      },
    },
    {
      path: '/updateSubmission',
      methods: {
        post: {
          middlewares: [isAuthenticated, isAdmin, adminCtrls.updateSubmission],
        },
      },
    },
    {
      path: '/getSubDetail',
      methods: {
        post: {
          middlewares: [isAuthenticated, adminCtrls.getSubDetail],
        },
      },
    },
    {
      path: '/getSubCropsByType',
      methods: {
        post: {
          middlewares: [isAuthenticated, adminCtrls.getSubCropsByType],
        },
      },
    },
    {
      path: '/createSubCropsByType',
      methods: {
        post: {
          middlewares: [isAuthenticated, adminCtrls.createSubCropsByType],
        },
      },
    },
    {
      path: '/updateSubCropsByType',
      methods: {
        post: {
          middlewares: [isAuthenticated, adminCtrls.updateSubCropsByType],
        },
      },
    },
    {
      path: '/approveSubmission',
      methods: {
        post: {
          middlewares: [isAuthenticated, adminCtrls.approveSubmission],
        },
      },
    },
    {
      path: '/getCropsByType',
      methods: {
        post: {
          middlewares: [isAuthenticated, adminCtrls.getCropsByType],
        },
      },
    },
    {
      path: '/getAllCreators',
      methods: {
        get: {
          middlewares: [adminCtrls.getAllCreators],
        },
      },
    },
    {
      path: '/getAgreement',
      methods: {
        post: {
          middlewares: [adminCtrls.getAgreement],
        },
      },
    },
    {
      path: '/addAgreement',
      methods: {
        post: {
          middlewares: [isAuthenticated, isAdmin, adminCtrls.addAgreement],
        },
      },
    },
    {
      path: '/getAllOrder',
      methods: {
        post: {
          middlewares: [adminCtrls.getAllOrder],
        },
      },
    },
    {
      path: '/getTotalStatistic',
      methods: {
        post: {
          middlewares: [adminCtrls.getTotalStatistic],
        },
      },
    },
  ],
};
