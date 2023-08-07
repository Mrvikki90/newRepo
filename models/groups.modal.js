module.exports = (mongoose) => {
  const groupSchema = mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
      ],
    },
    { timestamps: true }
  );

  const Groups = mongoose.model("Groups", groupSchema);
  return Groups;
};
