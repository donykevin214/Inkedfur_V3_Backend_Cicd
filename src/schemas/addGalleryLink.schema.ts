const addGalleryLink = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      errorMessage: {
        format: "Please enter a valid email"
      }
    },
    roles: {
      type: "string",
      enum: ["ADMIN", "CUSTOMER", "CREATOR"],
      errorMessage: {
        enum: "Invalid type. Possible values: 'ADMIN', 'CUSTOMER', 'CREATOR'"
      }
    },
    galleryLinks: {
      type: "array",
      errorMessage: {
        type: "Please enter galleryLinks"
      }
    }
  },
  required: ["email", "roles", "galleryLinks"],
  additionalProperties: false
}
export default addGalleryLink;