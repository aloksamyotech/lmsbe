// import mongoose from "mongoose";
// import { User } from "../models/user.js";
// import { request } from "express";

// export const getUserList = async (req, res) => {
//   try {
//     console.log("request-----", req.body);
//     console.log("request-----", req.body.full_name);

//     const { full_name, email, password, role, token_balance } = req.body;

//     const user = new User({
//       full_name,
//       email,
//       password,
//       role,
//       token_balance: token_balance
//         ? mongoose.Types.Decimal128.fromString(token_balance.toString())
//         : undefined,
//     });

//     await user.save();
//     res.status(201).json(user);
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).json({ error: "Error creating user" });
//   }
// };

import { User } from "../models/User.js";

export const getUserList = async (req, res) => {
  try {
    const newUserListTable = await User.find();

    console.log("new User List Table", newUserListTable);
    res.status(200).json({
      status: true,
      message: " User List Table successful",
      UserList: newUserListTable,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error", error });
  }
};
