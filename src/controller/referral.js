// import { Referral } from "../models/referral.js";
// export const referral = async (req, res) => {
//   try {
//     const { user_id, referred_user_id, created_date } = req.body;
//     console.log("req.body", req.body);

//     console.log("data......");
//     const newReferral = new Referral({
//       user_id,
//       referred_user_id,
//       created_date,
//     });
//     console.log("data......", user_id);
//     console.log("new Referral", newReferral);
//     const savedReferral = await newReferral.save();
//     return res.status(200).json({
//       status: true,
//       message: "Referral successful",
//       referral: savedReferral,
//     });
//   } catch (error) {
//     console.error("Error creating Referral", error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// export const referralTable = async (req, res) => {
//   try {
//     const newReferralTable = await referral.find();
//     res.status(200).json({
//       status: true,
//       message: "referral table successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: "Error in fetching referral table",
//     });
//   }
// };
