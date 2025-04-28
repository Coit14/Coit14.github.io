const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // Validate required fields
    if (!formData.canAdvertise) {
      return res.status(400).json({ error: 'Advertising preference is required' });
    }
    
    // Debug log (will appear in Vercel function logs)
    console.log('Attempting to send email with user:', process.env.EMAIL_USER);

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // or your SMTP host
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Format the email content for the company
    const emailContent = `
Dear Coit's Food Truck Team,

A new event booking request has been received.

━━━━━━━━━━ Contact Information ━━━━━━━━━━
• Name: ${formData.fullName}
• Email: ${formData.email}
• Facebook: ${formData.facebookUsername || 'Not provided'}

━━━━━━━━━━ Event Details ━━━━━━━━━━
• Name/Description: ${formData.eventName}
• Date: ${formData.eventDate}
• Time: ${formData.eventStartTime} to ${formData.eventEndTime}
• Location: ${formData.eventAddress}
• Expected Size: ${formData.eventSize}

━━━━━━━━━━ Event Type ━━━━━━━━━━
• Private Event: ${formData.isPrivateEvent}
• Can Advertise: ${formData.canAdvertise}
• Advertising Details: ${formData.advertisingDetails || 'Not provided'}

━━━━━━━━━━ Site Details ━━━━━━━━━━
• Additional Info: ${formData.parkingInfo || 'Not provided'}
`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'coitsfte@gmail.com', // Updated from placeholder
      subject: `New Event Booking: ${formData.eventName}`,
      text: emailContent
    });

    // Send confirmation email to customer with better formatting
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: formData.email,
      subject: 'Event Booking Request Received - Coit\'s Food Truck',
      text: `
Dear ${formData.email.split('@')[0]},

Thank you for your event booking request! We're excited about the possibility of being part of your event.

━━━━━━━━━━ Event Details ━━━━━━━━━━
• Event: ${formData.eventName}
• Date: ${formData.eventDate}
• Time: ${formData.eventStartTime} to ${formData.eventEndTime}
• Location: ${formData.eventAddress}

We will review your request and respond within a week. If you have any immediate questions, please reply to this email.

Best regards,
The Coit's Food Truck Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}; 