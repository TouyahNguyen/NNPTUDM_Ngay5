const express = require("express");
const router = express.Router();
const User = require("../models/User");

// CREATE - Tạo user mới
router.post("/", async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;
    const user = new User({
      username,
      password,
      email,
      fullName,
      avatarUrl,
      role,
    });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username hoặc email đã tồn tại" });
    }
    res.status(500).json({ message: error.message });
  }
});

// READ ALL - Lấy tất cả user (chưa bị xóa), hỗ trợ query theo username (includes)
// Yêu cầu 1: GET /users?username=abc → tìm user có username chứa "abc"
router.get("/", async (req, res) => {
  try {
    const filter = { isDeleted: false };

    if (req.query.username) {
      filter.username = { $regex: req.query.username, $options: "i" };
    }

    const users = await User.find(filter).populate("role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ENABLE - Chuyển status = true nếu email + username đúng (Yêu cầu 2)
router.post("/enable", async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp email và username" });
    }

    const user = await User.findOneAndUpdate(
      { email, username, isDeleted: false },
      { status: true },
      { new: true }
    ).populate("role");

    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy user với email và username này" });
    }

    res.json({ message: "Kích hoạt tài khoản thành công", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DISABLE - Chuyển status = false nếu email + username đúng (Yêu cầu 3)
router.post("/disable", async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp email và username" });
    }

    const user = await User.findOneAndUpdate(
      { email, username, isDeleted: false },
      { status: false },
      { new: true }
    ).populate("role");

    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy user với email và username này" });
    }

    res.json({ message: "Vô hiệu hóa tài khoản thành công", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ BY ID - Lấy user theo id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("role");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Cập nhật user
router.put("/:id", async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { username, password, email, fullName, avatarUrl, role },
      { new: true, runValidators: true }
    ).populate("role");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username hoặc email đã tồn tại" });
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE (soft delete) - Xóa mềm user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    res.json({ message: "Xóa user thành công (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
