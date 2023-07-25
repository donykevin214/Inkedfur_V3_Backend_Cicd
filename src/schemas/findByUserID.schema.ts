const findByUserID = {
  type: "object",
  properties: {
    user_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "User ID should have at least 24 hex characters"
      }
    }
  },
  required: ["user_id"],
  additionalProperties: false
}
export default findByUserID;