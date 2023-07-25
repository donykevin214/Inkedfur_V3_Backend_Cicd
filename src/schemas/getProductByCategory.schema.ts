const getProductByCategory = {
  type: "object",
  properties: {
    category: {
      type: "string",
      errorMessage: {
        type: "Please enter a valid category"
      }
    },
    skip: {
      type: "integer",
      errorMessage: {
        type: "Please enter a valid category"
      }
    },
    index: {
      type: "integer",
      errorMessage: {
        type: "Please enter a valid category"
      }
    }
  },
  required: ["category", "skip", "index"],
  additionalProperties: false
}
export default getProductByCategory;