import authCtrls from '~/controllers/auth.controllers';
import {isAuthenticated} from '~/controllers/common.controllers';
import validate from '~/lib/ajv';
import schema from '~/schemas';
import { validateProps } from '~/lib/ajv';
import { VERIFY_CODE_TYPES } from '~/helpers/constants.helper'
/**
 * @type { Routes.default }
 */

module.exports = {
    prefix: '/auth',
    routes: [
        {
            path: '/register',
            methods: {
                post: {
                    middlewares: [
                        validate({schema: schema.register} as validateProps), 
                        authCtrls.register,
                        validate({schema: schema.createStore} as validateProps),
                        authCtrls.createStore,
                    ],
                },
            },
        },
        {
            path: '/login',
            methods: {
                post: {
                    middlewares: [
                        validate({schema: schema.loginSchema} as validateProps), authCtrls.login
                    ],
                },
            },
        },
        {
            path: '/verifyCode',
            methods: {
                get: {
                    middlewares: [
                        validate({schema: schema.confirmVerifyCode, type: 'query'} as validateProps),
                        authCtrls.checkCode(VERIFY_CODE_TYPES.VALIDATE_EMAIL, false, 'query'),
                        authCtrls.activateAccount('query'),
                    ],
                },
                post: {
                    middlewares: [
                        validate({schema: schema.confirmVerifyCode} as validateProps),
                        authCtrls.checkCode(VERIFY_CODE_TYPES.VALIDATE_EMAIL, false),
                        authCtrls.activateAccount(),
                    ],
                },
            },
        },
        {
            path: '/resendVerifyCode',
            methods: {
                post: {
                    middlewares: [
                        validate({schema: schema.resendCode} as validateProps),
                        authCtrls.resendVerificationCode,
                    ],
                },
            },
        },
        {
            path: '/changePassword',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        validate({schema: schema.changePassword} as validateProps),
                        authCtrls.changePassword,            
                    ],
                },
            },
        },
        {
            path: '/updatePassword',
            methods: {
                post: {
                    middlewares: [
                        validate({schema: schema.updatePassword} as validateProps),
                        authCtrls.checkCode(VERIFY_CODE_TYPES.FORGOT_PASSWORD, true),
                        authCtrls.updatePassword,
                    ],
                },
            },
        },
        {
            path: '/addGalleryLink',
            methods: {
                post: {
                    middlewares: [
                        validate({schema: schema.addGalleryLink} as validateProps),
                        authCtrls.addGalleryLink
                    ],
                },
            },
        },
        {
            path: '/logout',
            methods: {
                post: {
                    middlewares: [
                        isAuthenticated,
                        authCtrls.logout
                    ],
                },
            },
        }
    ],
};
