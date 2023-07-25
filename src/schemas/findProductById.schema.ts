const findProductById = {
  type: "object",
  properties: {
    product_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "User ID should have at least 24 hex characters"
      }
    },
  },
  required: ["product_id"],
  additionalProperties: false
}
export default findProductById;