const addWishlist = {
  type: "object",
  properties: {
    product_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "Product ID should have at least 24 hex characters"
      }
    },
    wishlist_group_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "WishList Group ID should have at least 24 hex characters"
      }
    },
  },
  required: ["product_id", "wishlist_group_id"],
  additionalProperties: false
}
export default addWishlist;