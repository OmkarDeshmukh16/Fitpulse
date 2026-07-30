const DemoRequest = require('../models/DemoRequest.model');
const Settings = require('../models/Settings.model');
const User = require('../models/User.model');
const emailService = require('../services/email.service');

// Public: POST /api/demo-requests
exports.createDemoRequest = async (req, res) => {
  try {
    const { gymName, ownerName, email, phone, city, memberCount, notes } = req.body;

    if (!gymName || !ownerName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const demoRequest = await DemoRequest.create({
      gymName,
      ownerName,
      email,
      phone,
      city: city || '',
      memberCount: memberCount || '<100',
      notes: notes || '',
    });

    // Optionally notify superadmin via email
    try {
      await emailService.sendEmail({
        to: process.env.EMAIL_USER || email,
        subject: `🔥 New Gym Demo Request: ${gymName}`,
        html: `<h3>New Lead Received</h3>
               <p><strong>Gym:</strong> ${gymName}</p>
               <p><strong>Owner:</strong> ${ownerName}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Phone:</strong> ${phone}</p>
               <p><strong>City:</strong> ${city || 'N/A'}</p>
               <p><strong>Estimated Members:</strong> ${memberCount}</p>
               <p><strong>Notes:</strong> ${notes || 'None'}</p>`,
      });
    } catch (e) {
      console.log('Lead notification email skipped or failed:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully. Our team will contact you shortly with your custom payment link!',
      data: demoRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Super Admin: GET /api/demo-requests
exports.getDemoRequests = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { gymName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const requests = await DemoRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('gymId', 'gymName code')
      .populate('userId', 'name email');

    const total = await DemoRequest.countDocuments(query);

    // Summary counts for dashboard overview
    const pendingCount = await DemoRequest.countDocuments({ status: 'pending' });
    const paymentSentCount = await DemoRequest.countDocuments({ status: 'payment_link_sent' });
    const approvedCount = await DemoRequest.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      data: requests,
      summary: {
        total,
        pending: pendingCount,
        paymentSent: paymentSentCount,
        approved: approvedCount,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Super Admin: PATCH /api/demo-requests/:id
exports.updateDemoRequest = async (req, res) => {
  try {
    const { status, paymentLink, customMessage, notes } = req.body;
    const demoRequest = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      { status, paymentLink, customMessage, notes },
      { new: true, runValidators: true }
    );

    if (!demoRequest) {
      return res.status(404).json({ success: false, message: 'Demo request not found' });
    }

    res.json({ success: true, data: demoRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Super Admin: POST /api/demo-requests/:id/send-payment-link
exports.sendPaymentLink = async (req, res) => {
  try {
    const { paymentLink, customMessage } = req.body;
    if (!paymentLink) {
      return res.status(400).json({ success: false, message: 'Payment link is required' });
    }

    const demoRequest = await DemoRequest.findById(req.params.id);
    if (!demoRequest) {
      return res.status(404).json({ success: false, message: 'Demo request not found' });
    }

    demoRequest.paymentLink = paymentLink;
    demoRequest.customMessage = customMessage || '';
    demoRequest.status = 'payment_link_sent';
    await demoRequest.save();

    // Send email to gym owner with payment link
    let emailSent = false;
    try {
      await emailService.sendEmail({
        to: demoRequest.email,
        subject: `💳 Fitpulse Gym SaaS — Complete Payment for ${demoRequest.gymName}`,
        html: `<h2>Hello ${demoRequest.ownerName},</h2>
               <p>Thank you for requesting a demo of <strong>Fitpulse Gym Management SaaS</strong> for <strong>${demoRequest.gymName}</strong>!</p>
               <p>${customMessage || 'We are excited to help you automate and transform your gym management.'}</p>
               <p>Please use the button below to complete your payment and activate your gym workspace:</p>
               <p style="margin: 20px 0;">
                 <a href="${paymentLink}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Complete Payment & Activate</a>
               </p>
               <p>Or copy this link: <a href="${paymentLink}">${paymentLink}</a></p>
               <br/>
               <p>Best regards,<br/>The Fitpulse SaaS Team</p>`,
      });
      emailSent = true;
    } catch (e) {
      console.log('Payment link email could not be sent (SMTP not configured):', e.message);
    }

    res.json({
      success: true,
      message: emailSent
        ? 'Payment link sent to gym owner via email'
        : 'Payment link saved and status updated to payment_link_sent',
      data: demoRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Super Admin: POST /api/demo-requests/:id/approve — Provision Gym + Create Admin Account
exports.approveAndProvisionGym = async (req, res) => {
  try {
    const { password } = req.body;
    const demoRequest = await DemoRequest.findById(req.params.id);

    if (!demoRequest) {
      return res.status(404).json({ success: false, message: 'Demo request not found' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: demoRequest.email.toLowerCase() });
    if (existingUser && existingUser.gymId) {
      return res.status(400).json({ success: false, message: 'Account already created for this email' });
    }

    // 1. Create Settings (Gym Tenant)
    const settings = await Settings.create({
      gymName: demoRequest.gymName,
      address: demoRequest.city ? `${demoRequest.city}` : 'Main Branch',
      phone: demoRequest.phone,
      email: demoRequest.email,
      isSetupComplete: true,
    });

    // 2. Generate initial password
    const tempPassword = password || `Fitpulse@${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Create User (Gym Owner)
    let adminUser = existingUser;
    if (!adminUser) {
      adminUser = await User.create({
        gymId: settings._id,
        name: demoRequest.ownerName,
        email: demoRequest.email,
        password: tempPassword,
        role: 'gymowner',
      });
    } else {
      adminUser.gymId = settings._id;
      adminUser.role = 'gymowner';
      adminUser.password = tempPassword;
      await adminUser.save();
    }

    // 4. Update DemoRequest
    demoRequest.status = 'approved';
    demoRequest.gymId = settings._id;
    demoRequest.userId = adminUser._id;
    demoRequest.tempPassword = tempPassword;
    await demoRequest.save();

    // 5. Send Welcome Credentials Email
    try {
      await emailService.sendEmail({
        to: demoRequest.email,
        subject: `🎉 Welcome to Fitpulse! Your Gym SaaS Account is Active`,
        html: `<h2>Welcome to Fitpulse SaaS!</h2>
               <p>Dear ${demoRequest.ownerName},</p>
               <p>Your gym workspace for <strong>${demoRequest.gymName}</strong> is now live!</p>
               <div style="background: #1e1e38; padding: 16px; border-radius: 8px; color: #fff; margin: 16px 0;">
                 <p><strong>Login URL:</strong> http://localhost:5173/login</p>
                 <p><strong>Email:</strong> ${demoRequest.email}</p>
                 <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
               </div>
               <p>Please log in and update your password in Settings.</p>`,
      });
    } catch (e) {
      console.log('Welcome credentials email skipped or failed:', e.message);
    }

    res.json({
      success: true,
      message: `Gym "${demoRequest.gymName}" provisioned successfully!`,
      data: {
        demoRequest,
        gym: settings,
        credentials: {
          email: demoRequest.email,
          password: tempPassword,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/demo-requests/seed-superadmin — Ensure Super Admin Account Exists
exports.seedSuperAdmin = async (req, res) => {
  try {
    let superadmin = await User.findOne({ email: 'superadmin@fitpulse.com' });
    if (!superadmin) {
      superadmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@fitpulse.com',
        password: 'SuperAdmin@123',
        role: 'superadmin',
      });
      return res.status(201).json({
        success: true,
        message: 'Super Admin created successfully',
        credentials: { email: 'superadmin@fitpulse.com', password: 'SuperAdmin@123' },
      });
    }

    res.json({
      success: true,
      message: 'Super Admin already exists',
      credentials: { email: 'superadmin@fitpulse.com', password: 'SuperAdmin@123' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
