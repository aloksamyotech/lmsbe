import { User } from "../models/admin.js";

export const getUserList = async (req, res) => {
  try {
    const newUserListTable = await User.find({ active: false });

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
