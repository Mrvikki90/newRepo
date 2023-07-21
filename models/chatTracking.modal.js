module.exports = (mongoose) => {
  const chatTrackingSchema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // Reference to the User model (assuming you have a User model)
        required: true,
      },
      lastSelectedChat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "converstation", // Reference to the Chat model (assuming you have a Chat model)
      },
    },
    { timestamps: true }
  );
  const ChatTracking = mongoose.model("ChatTracking", chatTrackingSchema);
  return ChatTracking;
};
