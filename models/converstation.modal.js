module.exports = (mongoose) => {
  const converstationSchema = mongoose.Schema(
    {
      members: {
        type: Array,
      },
      messages: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "messages",
        },
      ],
      unreadMessages: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  );
  const Converstation = mongoose.model("converstation", converstationSchema);
  return Converstation;
};
