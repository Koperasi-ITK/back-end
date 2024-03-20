const jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt"),
  { JWT_SECRET } = require("../config/config");
//   slugify = require("slugify");

module.exports = {
  apiSuccess: (msg, data, extraData = {}) => {
    const response = {
      status: "success",
      message: msg,
      ...extraData,
      value: data,
    };
    return response;
  },

  apiError: (msg, errors) => {
    const response = {
      status: "error",
      message: msg,
      errors: errors,
    };
    return response;
  },

  createJwt: async (payload) => {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    } catch (error) {
      console.log(error);
    }
  },

  createHashData: async (data, saltRounds = 10) => {
    try {
      const hashedData = await bcrypt.hash(data, saltRounds);
      return hashedData;
    } catch (error) {
      console.log(error);
    }
  },

  verifyHashData: async (unhashed, hashed) => {
    try {
      const match = await bcrypt.compare(unhashed, hashed);
      return match;
    } catch (error) {
      console.log(error);
    }
  },
  //   createSlug: async (data) => {
  //     try {
  //       const dataSlug = await slugify(data, { lower: true, remove: /[*+~.()'"!:@]/g });
  //       return dataSlug;
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   },
};
