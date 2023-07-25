const changeCartProductQuantity = {
  type: "object",
  properties: {
    cart_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "User ID should have at least 24 hex characters"
      }
    },
    quantity: {
      type: "integer",
      errorMessage: {
        type: "Please input a valid quantity"
      }
    },
    product_sell_type: {
      type: "string",
      enum: ["PHYSICAL", "DIGITAL"],
      errorMessage: {
        enum: "Invalid type. Possible values: 'PHYSICAL', 'DIGITAL' "
      }
    },
    crop_size : {
      type: "string",
      enum: ["1x1", "3x7"],
      errorMessage: {
        enum: "Invalid type. Possible values: '1x1', '3x7' "
      }
    }
  },
  required: ["cart_id", "quantity",  "product_sell_type"],
  additionalProperties: false
}
export default changeCartProductQuantity;