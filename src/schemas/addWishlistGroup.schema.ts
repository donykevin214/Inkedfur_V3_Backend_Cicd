const addWishlistGroup = {
  type: "object",
  properties: {
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
  required: ["wishlistGroupName", "wishlistGroupDescription"],
  additionalProperties: false
}
export default addWishlistGroup;