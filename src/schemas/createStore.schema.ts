const createStore = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      errorMessage: {
        format: "Please enter a valid email"
      }
    },
    store_name: {
      type: "string",
      pattern: "^[\\w\\d\\s-]+$",
      errorMessage: {
        pattern: "Please enter a valid store name"
      }
    },
    description: {
      type: "string",
      pattern: "^[\\w\\d\\s-]+$",
      errorMessage: {
        pattern: "Please enter a valid description"
      }
    },
    status: {
      type: "string",
      errorMessage: {
        type: "Please enter a valid status"
      }
    },
  },
  required: ["email", "store_name"],
  additionalProperties: true
}
export default createStore;