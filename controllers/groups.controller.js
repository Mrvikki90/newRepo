const db = require("../database/database");
const Group = db.groups;

// Create a new group
exports.addGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const newGroup = await Group.create({ name, members });
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

// Get all groups
exports.getGroup = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ message: "Failed to fetch group" });
  }
};
