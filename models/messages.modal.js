module.exports = (mongoose) => {
  const messagesSchema = mongoose.Schema(
    {
      conversationId: {
        type: String,
      },
      userId: {
        type: String,
      },
      sender: {
        type: String,
      },
      text: {
        type: String,
      },
      offlineMessaes: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  );
  const messages = mongoose.model("messages", messagesSchema);
  return messages;
};
