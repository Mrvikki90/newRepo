module.exports = (mongoose) => {
  const messagesSchema = mongoose.Schema(
    {
      conversationId: {
        type: String,
      },
      sender: {
        type: String,
      },
      text: {
        type: String,
      },
    },
    { timestamps: true }
  );
  const messages = mongoose.model("messages", messagesSchema);
  return messages;
};
