import { VenderManagement } from "../models/vendor.management.js";
import {PurchaseManagement} from "../models/purchase.js";
import {BookManagement} from "../models/book.management.js"
export const addVenderBook = async (req, res) => {
  const {
    vendorName,
    companyName,
    address,
    date,
    phoneNumber,
    email,
  } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingVendor = await VenderManagement.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });

    if (existingVendor) {
      return res.status(400).send({ message: "Email already exists" });
    }

    const newVendor = new VenderManagement({
      vendorName,
      companyName,
      date,
      phoneNumber,
      email,
      address,
    });

    const savedVendor = await newVendor.save();
    return res.status(200).send(savedVendor);
  } catch (error) {
    console.error("Error in Vender Management", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getVenderManagement = async (req, res) => {
  try {
    const VenderManagementTable = await VenderManagement.find().populate(
      "user_id",  { active: false },
      { $sort: { _id: -1 } },
       
      null,
      null,
      { strictPopulate: false }
    );
    res.status(200).json({
      status: true,
      message: "Help Support Table successful",
      VenderManagement: VenderManagementTable,
    });
  } catch (error) {
    res.status(500).json({ message: " Internal server error", error });
  }
};
 
export const deleteVender = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Vender ID is required" });
  }

  try {
    const deletedVender = await VenderManagement.findByIdAndDelete(id,  { active: false },
     );
    if (!deletedVender) {
      return res.status(404).json({ message: " Vender not found" });
    }
    res.status(200).json({
      message: " Vender deleted successfully",
      deletedVender,
    });
  } catch (error) {
    console.error("Error deleting Vender:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateVender = async (req, res) => {
  const {
    id, 
    vendorName,
    companyName,
    address,
    phoneNumber,
    email,
    date
  } = req.body;

  try {
    const updatedVender = await VenderManagement.findByIdAndUpdate(
      id,
      {
        vendorName,
        companyName,
        address,
        phoneNumber,
        email,
        date
      },
      { new: true }
    );

    if (!updatedVender) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor updated successfully",
      updatedVender
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getVenderCount = async (req, res) => {
  try {
    const bookCount = await VenderManagement.countDocuments({});
    res.status(200).json({ count: bookCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book count", error });
  }
};
export const viewVendorDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await VenderManagement.findById(id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const purchases = await PurchaseManagement.find({ vendorId: id });

    const detailedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        const book = await BookManagement.findById(purchase.bookId);
        return {
          ...purchase._doc,
          bookDetails: book || null
        };
      })
    );

    res.status(200).json({
      vendor,
      purchases: detailedPurchases
    });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
