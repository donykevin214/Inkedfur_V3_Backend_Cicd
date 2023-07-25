const cropProduct = {
  type: "object",
  properties: {
    product_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "Product ID should have at least 24 hex characters"
      }
    },
    crop_list: {
      type: "array",
      items: {
        type: "object",
        properties:{
          size: {
            type: "string",
            enum: ["1x1", "3x7"],
            errorMessage: {
              enum: "Invalid type. Possible values: '1x1', '3x7' "
            }
          },
          quantity: {
            type: "integer",
            maximum: 100,
            errorMessage: {
              type: "Please input a vaild quantity"
            }
          },
          price: {
            type: "integer",
            maximum: 100000,
            errorMessage: {
              type: "Please input a vaild quantity"
            }
          },
          royalty: {
            type: "integer",
            maximum: 100,
            errorMessage: {
              type: "Please input a vaild quantity"
            }
          },
        },
        required: ["size"],
      }
    },
  },
  required: ["product_id", "crop_list"],
  additionalProperties: false
}
export default cropProduct;