const updatePassword = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      errorMessage: {
        type: "Please enter a valid email"
      }
    },
    password: {
      type: "string",
      minLength: 6,
      errorMessage: {
        type: "Password should have at least 6 characters"
      }
    },
    code: {
      type: "integer",
      maximum: 1000000,
      errorMessage: {
        minLength: "Verification Code should have at least 4 characters"
      }
    },
  },
  required: ["email",  "password", "code"],
  additionalProperties: false
}
export default updatePassword;