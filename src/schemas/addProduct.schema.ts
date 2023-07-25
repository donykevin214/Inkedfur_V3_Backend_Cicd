const addProduct = {
  type: "object",
  properties: {
    user_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "User ID should have at least 24 hex characters"
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
        type: "Please endter a valid category"
      }
    },
    store_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "Store ID should have at least 24 hex characters"
      }
    },
    submission_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "Submission ID should have at least 24 hex characters"
      }
    }
  },
  required: ["user_id", "product_name", "category", "store_id"],
  additionalProperties: false
}
export default addProduct;