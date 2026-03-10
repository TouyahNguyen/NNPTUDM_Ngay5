const express = require("express");
const router = express.Router();
const Role = require("../models/Role");
const User = require("../models/User");

// CREATE - Tạo role mới
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const role = new Role({ name, description });
    const savedRole = await role.save();
    res.status(201).json(savedRole);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Role name đã tồn tại" });
    }
    res.status(500).json({ message: error.message });
  }
});

// READ ALL - Lấy tất cả role (chưa bị xóa)
router.get("/", async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ BY ID - Lấy role theo id
router.get("/:id", async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy role" });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Cập nhật role
router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { name, description },
      { new: true, runValidators: true }
    );
    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy role" });
    }
    res.json(role);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Role name đã tồn tại" });
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE (soft delete) - Xóa mềm role
router.delete("/:id", async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy role" });
    }
    res.json({ message: "Xóa role thành công (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET USERS BY ROLE ID - Lấy tất cả user có role = id (Yêu cầu 4)
router.get("/:id/users", async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy role" });
    }

    const users = await User.find({
      role: req.params.id,
      isDeleted: false,
    }).populate("role");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
