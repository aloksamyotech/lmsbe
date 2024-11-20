
// import { request } from "express"; 
// import { Notification } from "../models/notification.Admin.js";

// export const notification = async (req, res) => {
//   const { name,title, description, status } = req.body;
//   try {
//     console.log("Loading................................");
//     console.log("print data", req.body);

//     const NotificationSchema = new Notification({
//       name,
//       title,
//       description,
//       status,
//     });

//     const notificationData = await NotificationSchema.save();
//     console.log("Notification Data", notificationData);
//     return res.status(200).send(notificationData);
//   } catch (error) {
//     console.error("Error in Notification", error);
//     return res.status(500).send({ message: "Internal Server Error" });
//   }
// };


// export const getNotification = async (req, res) => {
//   try {
//     const { name, title, description } = req.body;

//     console.log("request.body",req.body);
    
//     const newNotification = new Notification({
//       name,
//       title,
//       description, 
//     });
//     await newNotification.save();
//     res.status(201).json({ message: " Notification created successfully" });
//   } catch (error) {
//     console.error("Error saving  Notification data:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const newNotification = async (req, res) => {
//   try {
//       const newNotificationTable = await Notification.find().populate(
//         "user_id",
//         null,
//         null,
//         { strictPopulate: false }
//       );
//       console.log("new Notification Table", newNotificationTable);
//       res.status(200).json({
//         status: true,
//         message: "notification Table successful",
//         Notification: newNotificationTable,
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: " Internal server error", error });
//     }
// };

 