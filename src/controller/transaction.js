// import { Transaction } from "../models/transaction.js";
// export const transaction = async (req, res) => {
//   try {
//     const {user_id,token_id,amount,transaction_type,transaction_date,status, } = req.body;
//     console.log("req.body",req.body);
    
//     const transactionSchema = new Transaction({
//       user_id,
//       token_id,
//       amount,
//       transaction_type,
//       transaction_date,
//       status,
//     });
//     const transactionData = await transactionSchema.save();
//     console.log(transactionData);
//     res.status(201).send(transactionData);
//   } catch (error) {
//     console.error("Error in  Transaction:", error);
//     return res.status(500).send({ message: "Internal Server Error" });
//   }
// };
