const editProfile = {
  type: "object",
  properties: {
    user_id: {
      type: "string",
      minLength: 24,
      errorMessage: {
        minLength: "User ID should have at least 24 hex characters"
      }
    },
    username: {
      type: "string",
      pattern: "^[\\w\\d\\s-]+$",
      errorMessage: {
        pattern: "Please input a vaild username"
      }
    },
    description: {
      type: "string",
      pattern: "^[\\w\\d\\s-]+$",
      errorMessage: {
        pattern: "Please input a vaild description"
      }
    },
    socials: {
      type: "array",
      items: {
        type: "object",
        properties:{
          social_name: {
            type: "string",
            pattern: "^[\\w\\d\\s-]+$",
            errorMessage: {
              pattern: "Please input a vaild social name"
            }
          },
          url: {
            type: "string",
            errorMessage: {
              pattern: "Please input a vaild social link"
            }
          },
        },
        required: ["social_name", "url"],
      }
    },
  },
  required: ["user_id", "username", "description", "socials"],
  additionalProperties: true
}
export default editProfile;