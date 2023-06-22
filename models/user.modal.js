module.exports = (mongoose) => {
  const Schema = mongoose.Schema({
    name: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },
    profileImg: {
      type: String,
    },
  });
  const User = mongoose.model("users", Schema);
  return User;
};
