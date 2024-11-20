// import { request } from "express"; 
// import { HelpSupport } from "../models/helpSupport.js";

// export const userHelpSupport = async (req, res) => {
//   try {
//     const newUserHelpSupport = await HelpSupport.find() 
    
//     console.log("new User Help Support", newUserHelpSupport);
//     console.log("Response",newUserHelpSupport);
//     res.status(200).json({
//       status: true,
//       message: " User Help Support successful",
//       UserList: newUserHelpSupport,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: " Internal server error", error });
//   }
// };
