import { SubscriptionType } from "../models/subscriptionType.model.js";

export const addSubscriptionType = async (req, res) => {
  const { title, amount, discount, active, desc, numberOfDays } = req.body; 

  try {
    const newSubscription = new SubscriptionType({
      title,
      amount,
      discount,
      active,
      desc,
      numberOfDays,
    });

    const savedSubscription = await newSubscription.save();
    return res.status(200).send(savedSubscription);
  } catch (error) {
    console.error("Error saving  Subscription:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getSubscriptionTypeTable = async (req, res) => {
  try {
    const SubscriptionTypeTable = await SubscriptionType.find().populate(
      "user_id",  { active: false },
      { $sort: { _id: -1 } },
       
      null,
      null,
      {
        strictPopulate: false,
      }
    ); 
    res.status(200).json({
      status: true,
      message: " Subscription  Table successful",
      SubscriptionType: SubscriptionTypeTable,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error", error });
  }
};

export const deleteSubscriptionType = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Subscription Type ID is required" });
  }

  try {
    const deletedSubscription = await SubscriptionType.findByIdAndDelete(id,  { active: false },
      );
    if (!deletedSubscription) {
      return res.status(404).json({ message: " Vender not found" });
    }
    res.status(200).json({
      message: " Subscription deleted successfully",
      deletedSubscription,
    });
  } catch (error) {
    console.error("Error deleting Subscription:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSubscriptionType = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    amount,
    discount,
    numberOfDays,
  } = req.body;

  try {
    const updateSubscription = await SubscriptionType.findByIdAndUpdate(
      id,   
       
      {
        title,
        amount,
        discount,
        numberOfDays,
      },
      { new: true }
    );

    if (!updateSubscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json({
      message: " Subscription updated successfully",
      updateSubscription,
    });
  } catch (error) {
    console.error("Error updatingVender:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
