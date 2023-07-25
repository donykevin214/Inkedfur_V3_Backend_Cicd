const deleteWishlistGroup = {
  type: "object",
  properties: {
    id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "WishList Group ID should have at least 24 hex characters"
      }
    },
  },
  required: ["id"],
  additionalProperties: false
}
export default deleteWishlistGroup;