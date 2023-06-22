module.exports = (mongoose) => {
  const converstationSchema = mongoose.Schema(
    {
      members: {
        type: Array,
      },
    },
    { timestamps: true }
  );
  const User = mongoose.model("converstation", converstationSchema);
  return User;
};
