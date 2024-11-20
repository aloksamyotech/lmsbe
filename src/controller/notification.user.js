// import { Notification } from "../models/notification.Admin.js";
// // import { Notification } from "../models/notification";

// export const postNotificationUser = async (req, res) => {
//   try {
//     const { title,description,name,status} = req.body;

//     console.log("request.body", req.body);

//     const newNotificationUser = new Notification({
//         // name,
//         _id,
//         title,
//         description,
//         status,
       
//     });
//     // console.log("request.body.....", req.body.title);
    
//     await newNotificationUser.save();
//     res.status(201).json({ message: " Notification created successfully" });
//   } catch (error) {
//     console.error("Error saving  Notification data:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const getNotificationUser = async (req, res) => {
//     try {
//         const getNotificationTable = await Notification.find().populate(
//           "user_id",
//           null,
//           null,
//           { strictPopulate: false }
//         );
//         console.log("new Notification Table", getNotificationTable);
//         res.status(200).json({
//           status: true,
//           message: "notification Table successful",
//           Notification: getNotificationTable,
//         });
//       } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: " Internal server error", error });
//       }
//   };