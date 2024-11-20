// import { request } from "express";
// import { HelpSupport } from "../models/helpSupport.js";

// // export const helpSupport = async (req, res) => {
// //   const { title, description, status } = req.body;
// //   try {
// //     console.log("Loading................................");
// //     console.log("print data", req.body);

// //     const HelpSupportSchema = new HelpSupport({
// //       title,
// //       description,
// //       status,
// //     });

// //     const helpSupportData = await HelpSupportSchema.save();
// //     console.log("helpSupportData", helpSupportData);
// //     return res.status(200).send(helpSupportData);
// //   } catch (error) {
// //     console.error("Error in helpSupport", error);
// //     return res.status(500).send({ message: "Internal Server Error" });
// //   }
// // };

// export const helpSupport = async (req, res) => {
//   try {
//       const query = req.user.role === "admin"
//           ? {} // Admins can see all help and support entries
//           : { user: req.user.id }; // Regular users see only their entries

//       const newHelpSupportTable = await HelpSupport.find(query).populate("user_id", null, null, { strictPopulate: false });
//       res.status(200).json({
//           status: true,
//           message: "Help Support Table successful",
//           HelpSupport: newHelpSupportTable,
//       });
//   } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Internal server error", error });
//   }
// };


// export const purchaseTable = async (req, res) => {
//   try {
//     console.log("data......");

//     const newPurchaseTable = await Purchase.find();
//     console.log("newPurchaseTable", newPurchaseTable);
//     res.status(200).json({
//       status: true,
//       message: "Purchase Table successful",
//       purchase: newPurchaseTable,
//     });
//   } catch (error) {
//     res.status(500).json({ message: " Internal server error", error });
//   }
// };

// export const newHelpSupport = async (req, res) => {
//     try {
//         const newHelpSupportTable = await HelpSupport.find().populate(
//           "user_id",
//           null,
//           null,
//           { strictPopulate: false }
//         );
//         console.log("newHelpSupportTable", newHelpSupportTable);
//         res.status(200).json({
//           status: true,
//           message: "Help Support Table successful",
//           HelpSupport: newHelpSupportTable,
//         });
//       } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: " Internal server error", error });
//       }
// };

// export const getHelpSupport = async (req, res) => {
//   try {
//     const { id, title, description } = req.body;

//     console.log("request.body",req.body);
    
//     const newHelpSupport = new HelpSupport({
//       user:id,
//       title,
//       description, 
//     });
//     await newHelpSupport.save();
//     res.status(201).json({ message: "Help & Support created successfully" });
//   } catch (error) {
//     console.error("Error saving Help & Support data:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
