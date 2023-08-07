import { isAdmin, isAuthenticated, isCreator } from '~/controllers/common.controllers';
import userCtrls from '~/controllers/user.controllers';
import validate from '~/lib/ajv';
import schema from '~/schemas';
import { validateProps } from '~/lib/ajv';
module.exports = {
    prefix: '/user',
    routes: [
        {
            path: '/getStatistic',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        userCtrls.getStatistic
                    ],
                },
            },
        },
        {
            path: '/setUserStatus',
            methods: {
                post: {
                    middlewares: [
                        validate({ schema: schema.setUserStatus } as validateProps),
                        isAuthenticated,
                        isAdmin,
                        userCtrls.setUserStatus,
                    ],
                },
            },
        },
        {
            path: '/setUserStatusByIpAddress',
            methods: {
                post: {
                    middlewares: [
                        validate({ schema: schema.setUserStatusByIpAddress } as validateProps),
                        isAuthenticated,
                        isAdmin,
                        userCtrls.setUserStatusByIpAddress,
                    ],
                },
            },
        },
        {
            path: '/updateSignature',
            methods: {
                post: {
                    middlewares: [
                        userCtrls.updateSignature
                    ],
                },
            },
        },
        {
            path: '/editProfile',
            methods: {
                post: {
                    middlewares: [
                        // validate({ schema: schema.editProfile } as validateProps),
                        userCtrls.editProfile
                    ],
                },
            },
        },
        {
            path: '/updateRole',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        userCtrls.updateRole
                    ],
                },
            },
        },
        {
            path: '/creatorSetting',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        userCtrls.creatorSetting
                    ],
                },
            },
        },
        {
            path: '/updateUserName',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        userCtrls.updateUserName
                    ],
                },
            },
        },
        {
            path: '/updateVisitors',
            methods: {
                post: {
                    middlewares: [
                        userCtrls.updateVisitors,
                    ],
                },
            },
        },
        {
            path: '/getCreatorByID',
            methods: {
                post: {
                    middlewares: [
                        userCtrls.getCreatorByID
                    ],
                },
            },
        },
        {
            path: '/getCreators',
            methods: {
                post: {
                    middlewares: [
                        userCtrls.getCreators
                    ],
                },
            },
        },
        {
            path: '/getTopCreators',
            methods: {
                get: {
                    middlewares: [
                        userCtrls.getTopCreators
                    ],
                },
            },
        },
        {
            path: '/getCustomers',
            methods: {
                get: {
                    middlewares: [
                        userCtrls.getCustomers
                    ],
                },
            },
        },
        {
            path: '/deleteUser',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        userCtrls.deleteUser
                    ],
                },
            },
        }
    ],
};
