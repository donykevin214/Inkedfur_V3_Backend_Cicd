const addCartProduct = {
  type: "object",
  properties: {
    product_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "Product ID should have at least 24 hex characters"
      }
    },
    quantity: {
      type: "integer",
      errorMessage: {
        type: "Please input valid quantity"
      }
    },
    product_sell_type: {
      type: "string",
      enum: ["PHYSICAL", "DIGITAL"],
      errorMessage: {
        enum: "Invalid type. Possible values: 'PHYSICAL', 'DIGITAL' "
      }
    },
    crop_size: {
      type: "string",
      errorMessage: {
        type: "Invalid type"
      }
    }
  },
  required: ["product_id", "quantity", "product_sell_type"],
  additionalProperties: false
}
export default addCartProduct;