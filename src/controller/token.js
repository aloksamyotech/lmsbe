// import { Token } from "../models/token.js";

// export const purchaseToken = async (value) => {
//   try {
//     const data = await Token.findOne().lean();
//     console.log("data: ", data);
//     let remain = data?.token_avl - value;
//     console.log("ramaining: " + remain);
//     await Token.updateOne({
//       $set: { token_avl: remain },
//     });
//     return true;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// };

// export const findToken = async (req, res) => {
//   try {
//     const data = await Token.findOne().lean();
//     console.log("data: ", data);
//     res.status(200).send(data);
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// };
