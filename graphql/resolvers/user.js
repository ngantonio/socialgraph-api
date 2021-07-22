const User = require('../../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../../config');
const { UserInputError } = require('apollo-server')

const { validateRegisterInput, validateLoginInput} = require('../../utils/validators')


const generateAuthToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" })
};



const UserResolvers = {
  Query: {
    async getUsers () {
     
    }
  },

  Mutation: {
    async register(_, {registerInput: {username, email, password, confirmPassword }}, context, info) {
      console.log("entra");
      // Validate user req data
      const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      try {
        // validate if user exist
        let userExist = await User.findOne({ email })
        if (userExist) throw new UserInputError("user already exists", { errors: { email: "user already exists" } });
        
        // create user
        let newUser = new User({username, email, password });
        // hash password
        newUser.password = await bcryptjs.hash(password, 10);
        // save user
        const res = await newUser.save();

        // create and sign JWT token
        const payload = {
          user: {
            id: newUser._id,
            email: newUser.email,
            username: newUser.username
          }
        };

        const token = generateAuthToken(payload);
        return {...res._doc, id: res._id, token }

      } catch (error) {
        return error
      }  
    },

    async login(_, { loginInput: { email, password } }, context, info) {
      
      // Validate user req data
      const { valid, errors } = validateLoginInput(email, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      try {
        // validate if user not exist
        let userExist = await User.findOne({ email })
        if (!userExist) {
          errors.general = "user not registered"
          throw new UserInputError("AuthError", { errors });
        }
        
        // validate password
        const correctPassword = await bcryptjs.compare(password, userExist.password)
        if (!correctPassword) {
          errors.general = "Invalid Credentials"
          throw new UserInputError("AuthError", { errors });
        }
        
        // create and sign JWT token
        const payload = {
          user: {
            id: userExist._id,
            email: userExist.email,
            username: userExist.username
          }
        };

        const token = generateAuthToken(payload);
        return {...userExist._doc, id: userExist._id, token }

      } catch (error) {
        return error
         
      }  
    }
  }
}

module.exports = UserResolvers;



/**
 * mutation {
  register(
    registerInput: {
      username: "gabrielantonio"
      email: "oliveiragabr998@outlook.com"
      password: "123456"
      confirmPassword: "123456"
    }
  ) {
    id
    username
    email
    token
  }
}
*/

/**
 * mutation {
  login(
    loginInput: {
      email: "oliveiragabr@outlook.com"
      password: "123456"
    }
  ) {
    id
    username
    email
    token
  }
}

 */