const setUserStatusByIpAddress = {
  type: "object",
  properties: {
    ipAddress: {
      type: "string",
      format: "ipv4",
      errorMessage: {
        format : "Invalid Ip Address Type"
      }
    },
    status: {
      type: "string",
      enum: ["PENDING", "ACTIVATE", "DEACTIVATE", "SUSPENDED"],
      errorMessage: {
        enum: "Invalid type. Possible values: 'PENDING', 'ACTIVATE', 'DEACTIVATE', 'SUSPENDED'"
      }
    },
  },
  required: ["ipAddress",  "status"],
  additionalProperties: false
}
export default setUserStatusByIpAddress;