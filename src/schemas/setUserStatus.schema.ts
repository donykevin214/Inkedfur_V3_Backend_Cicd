const setUserStatus = {
  type: "object",
  properties: {
    user_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "User ID should have at least 24 hex characters"
      }
    },
    status: {
      type: "string",
      enum: ["PENDING", "ACTIVATE", "DEACTIVATE", "SUSPENDED"],
      errorMessage: {
        enum: "Invalid type. Possible values: 'PENDING', 'ACTIVATE', 'DEACTIVATE', 'SUSPENDED'"
      }
    }
  },
  required: ["user_id", "status"],
  additionalProperties: false
}
export default setUserStatus;