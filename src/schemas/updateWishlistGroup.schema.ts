const updateWishlistGroup = {
  type: "object",
  properties: {
    id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "WishList Group ID should have at least 24 hex characters"
      }
    },
    wishlistGroupName: {
      type: "string",
      pattern: "^[\\w\\d\\s-]+$",
      errorMessage: {
        pattern: "Please input a vaild wishlist group name"
      }
    },
    wishlistGroupDescription: {
      type: "string",
      pattern: "^[\\w\\d\\s-]+$",
      errorMessage: {
        pattern: "Please input a vaild wishlist group name"
      }
    }
  },
  required: ["id", "wishlistGroupName", "wishlistGroupDescription"],
  additionalProperties: false
}
export default updateWishlistGroup;