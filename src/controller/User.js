// import { Purchase } from "../models/purchase.js";
// import { Token } from "../models/token.js";
// // import { User } from "../models/user.js";
// import jwt from "jsonwebtoken";
// import { User } from "../models/User.js";

// export const registerUser = async (req, res) => {
//   try {
//     const { first_name, last_name, email, password, role} = req?.body;
//     console.log("Request body", req.body);

//     const UserSchema = new User({
//       first_name,
//       last_name,
//       email,
//       password,
//       role, 
//     });

//     const UserData = await UserSchema.save();
//     console.log(UserData);
//     res.status(201).send(UserData);
//   } catch (error) {
//     console.error("Error in registerUser:", error);
//     return res.status(500).send({ message: "Internal Server Error in admin" });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req?.body;
//     console.log("Request body", req.body);
//     const UserData = await User.findOne({
//       email: email,
//     }).lean();

//     if (!UserData) {
//       return res.status(404).send({ message: "User not found" });
//     }

//     if (password === UserData.password) {
//       var token = jwt.sign(UserData, "secret_key");
//       UserData.token = token;
//       res.status(200).send(UserData);
//     } else {
//       res.status(401).send({ message: "Invalid credentials" });
//     }
//   } catch (error) {
//     console.error("Error in registerUser:", error);
//     return res.status(500).send({ message: "Internal Server Error" });
//   }
// };

// export const report = async (req, res) => {
//   try {
//     const tokenInfo = await Token.findOne().lean();
//     const userInfo = await User.find().lean();
//     const purchaseInfo = await Purchase.find().lean();
//     const response = { userInfo, ...tokenInfo, purchaseInfo };
//     console.log("response", response);
//     res.status(200).send(response);
//   } catch (error) {}
// };

// export const getUserDetails = async (req, res) => {
//   try {
//     console.log("Data............");

//     const { userId } = req.query;
//     console.log("user id", userId);

//     const user = await User.findById(userId).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json({ user });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// export const getAllUsers = async (req, res) => {
//   try {
//     // Fetch all users from the database, excluding passwords
//     const users = await User.find().select("-password");
    
//     // Check if any users were found
//     if (!users.length) {
//       return res.status(404).json({ message: "No users found" });
//     }
    
//     // Send the users data in the response
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("Error in getAllUsers:", error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// };
