const findByCardId = {
  type: "object",
  properties: {
    cart_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "Cart ID should have at least 24 hex characters"
      }
    }
  },
  required: ["cart_id"],
  additionalProperties: false
}
export default findByCardId;