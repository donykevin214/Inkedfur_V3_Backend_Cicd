const updateProduct = {
  type: "object",
  properties: {
    product_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "Product ID should have at least 24 hex characters"
      }
    },
    product_name: {
      type: "string",
      pattern: "^[\\w\\d\\s-]+$",
      errorMessage: {
        pattern: "Please enter a valid product name"
      }
    },
    category: {
      type: "string",
      errorMessage: {
        type: "Please type a valid category"
      }
    },
    store_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "Store ID should have at least 24 hex characters"
      }
    }
  },
  required: ["product_id", "product_name", "category", "store_id"],
  additionalProperties: false
}
export default updateProduct;