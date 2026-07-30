const Settings = require('../models/Settings.model');
const User = require('../models/User.model');

// GET /api/settings
exports.getSettings = async (req, res) => {
  const settings = await Settings.findById(req.user.gymId);
  if (!settings) return res.status(404).json({ success: false, message: 'Gym settings not found' });
  res.json({ success: true, data: settings });
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  const settings = await Settings.findByIdAndUpdate(req.user.gymId, req.body, {
    new: true,
    runValidators: true,
    upsert: true,
  });
  res.json({ success: true, data: settings });
};

// POST /api/settings/setup — Initial gym setup (creates Settings + first admin user)
exports.initialSetup = async (req, res) => {
  const { gymName, address, phone, email, adminName, adminEmail, adminPassword } = req.body;

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    return res.status(400).json({ success: false, message: 'Admin email already in use' });
  }

  const settings = await Settings.create({
    gymName,
    address,
    phone,
    email,
    isSetupComplete: true,
  });

  const admin = await User.create({
    gymId: settings._id,
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'gymowner',
  });

  res.status(201).json({
    success: true,
    message: 'Gym setup complete',
    data: { settings, admin: admin.toJSON() },
  });
};

// GET /api/settings/staff — List all staff users for this gym
exports.getStaff = async (req, res) => {
  const staff = await User.find({ gymId: req.user.gymId }).select('-password -refreshToken');
  res.json({ success: true, data: staff });
};

// POST /api/settings/staff — Add a staff member
exports.addStaff = async (req, res) => {
  const { name, email, password, role } = req.body;
  const allowedRoles = ['manager', 'trainer', 'receptionist'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role for staff member' });
  }

  const staff = await User.create({ gymId: req.user.gymId, name, email, password, role });
  res.status(201).json({ success: true, data: staff.toJSON() });
};

// PUT /api/settings/staff/:id — Update staff
exports.updateStaff = async (req, res) => {
  const { name, role, isActive } = req.body;
  const staff = await User.findOneAndUpdate(
    { _id: req.params.id, gymId: req.user.gymId },
    { name, role, isActive },
    { new: true }
  ).select('-password -refreshToken');

  if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
  res.json({ success: true, data: staff });
};
