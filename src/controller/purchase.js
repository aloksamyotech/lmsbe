// import { Purchase } from "../models/purchase.js";
// import { User } from "../models/User.js";
// import jwt from "jsonwebtoken";
// import { purchaseToken } from "./token.js";

// export const createPurchase = async (req, res) => {
//   const { user_id, amount_paid, tokens } = req.body;
//   console.log("req.body ", req.body);
//   const amountFloat = parseFloat(amount_paid);
//   const tokensFloat = parseFloat(tokens);

//   try {
//     const newPurchase = new Purchase({
//       user_id,
//       token: tokensFloat,
//       amount_paid: amountFloat,
//       token_amount: amountFloat,
//     });
//     const data = await purchaseToken(tokensFloat);
//     if (!data) {
//       return res.status(500).json({
//         status: false,
//         message: "Something went wrong",
//         purchase: [],
//       });
//     }
//     const savedPurchase = await newPurchase.save();

//     return res.status(201).json({
//       status: true,
//       message: "Purchase successful",
//       purchase: savedPurchase,
//     });
//   } catch (error) {
//     console.error("Error creating purchase:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// export const purchaseTable = async (req, res) => {
//   try {
//     const newPurchaseTable = await Purchase.find().populate(
//       "user_id",
//       null,
//       null,
//       { strictPopulate: false }
//     );
//     console.log("newPurchaseTable", newPurchaseTable);
//     res.status(200).json({
//       status: true,
//       message: "Purchase Table successful",
//       purchase: newPurchaseTable,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: " Internal server error", error });
//   }
// };
