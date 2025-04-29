import nodemailer from 'nodemailer';

export async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // Minimal backend validation for required fields
    const requiredFields = [
      'fullName',
      'email',
      'eventName',
      'eventDate',
      'eventStartTime',
      'eventEndTime',
      'eventAddress',
      'eventSize',
      'isPrivateEvent',
      'otherFoodTrucks',
      'canAdvertise'
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    
    console.log('Attempting to send email with user:', process.env.EMAIL_USER);

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Format time to AM/PM
    const formatTimeToAMPM = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    // Common CSS styles for both emails
    const emailStyles = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        line-height: 1.6;
        color: #333333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .header {
        background-color: #a3342f;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .logo {
        max-width: 200px;
        margin: 0 auto 15px auto;
        display: block;
      }
      .content {
        background-color: #ffffff;
        padding: 20px;
        border: 1px solid #afb0aa;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .section {
        background-color: #ffffff;
        padding: 15px;
        margin: 10px 0;
        border: 1px solid #f5f5f5;
        border-radius: 4px;
      }
      .section-title {
        color: #a3342f;
        font-weight: bold;
        margin-bottom: 10px;
        border-bottom: 2px solid #a3342f;
        padding-bottom: 5px;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #afb0aa;
        color: #434342;
      }
      .info-row {
        margin: 8px 0;
        padding: 4px 0;
      }
      .label {
        font-weight: bold;
        color: #434342;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #a3342f;
        color: #ffffff;
        text-decoration: none;
        border-radius: 4px;
        margin: 10px 0;
      }
    `;

    // Format the email content for the company
    const companyEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="header">
        <img src="cid:logo" alt="Coit's Food Truck" class="logo"/>
        <h1>New Event Booking Request</h1>
      </div>
      <div class="content">
        <div class="section">
          <div class="section-title">Contact Information</div>
          <div class="info-row"><span class="label">Name:</span> ${formData.fullName}</div>
          <div class="info-row"><span class="label">Email:</span> ${formData.email}</div>
          <div class="info-row"><span class="label">Facebook:</span> ${formData.facebookUsername || 'Not provided'}</div>
        </div>

        <div class="section">
          <div class="section-title">Event Details</div>
          <div class="info-row"><span class="label">Name/Description:</span> ${formData.eventName}</div>
          <div class="info-row"><span class="label">Date:</span> ${formData.eventDate}</div>
          <div class="info-row"><span class="label">Time:</span> ${formatTimeToAMPM(formData.eventStartTime)} to ${formatTimeToAMPM(formData.eventEndTime)}</div>
          <div class="info-row"><span class="label">Location:</span> ${formData.eventAddress}</div>
          <div class="info-row"><span class="label">Expected Size:</span> ${formData.eventSize}</div>
          <div class="info-row"><span class="label">Other Food Trucks:</span> ${formData.otherFoodTrucks === 'yes' ? 'Yes' : 'No'}</div>
        </div>

        <div class="section">
          <div class="section-title">Event Type</div>
          <div class="info-row"><span class="label">Private Event:</span> ${formData.isPrivateEvent}</div>
          <div class="info-row"><span class="label">Can Advertise:</span> ${formData.canAdvertise}</div>
          <div class="info-row"><span class="label">Advertising Details:</span> ${formData.advertisingDetails || 'Not provided'}</div>
        </div>

        <div class="section">
          <div class="section-title">Site Details</div>
          <div class="info-row"><span class="label">Additional Info:</span> ${formData.parkingInfo || 'Not provided'}</div>
        </div>
      </div>
    </body>
    </html>
    `;

    // Format the email content for the customer
    const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="header">
        <img src="cid:logo" alt="Coit's Food Truck" class="logo"/>
        <h1>Event Booking Confirmation</h1>
      </div>
      <div class="content">
        <p>Hello ${formData.fullName},</p>
        
        <p>Thank you for your event booking request! We're excited about the possibility of being part of your event.</p>

        <div class="section">
          <div class="section-title">Event Details</div>
          <div class="info-row"><span class="label">Event:</span> ${formData.eventName}</div>
          <div class="info-row"><span class="label">Date:</span> ${formData.eventDate}</div>
          <div class="info-row"><span class="label">Time:</span> ${formatTimeToAMPM(formData.eventStartTime)} to ${formatTimeToAMPM(formData.eventEndTime)}</div>
          <div class="info-row"><span class="label">Location:</span> ${formData.eventAddress}</div>
          <div class="info-row"><span class="label">Other Food Trucks:</span> ${formData.otherFoodTrucks === 'yes' ? 'Yes' : 'No'}</div>
        </div>

        <p>We will review your request and respond within a week. If you have any immediate questions, please reply to this email.</p>

        <div class="footer">
          <p>Best regards,<br>The Coit's Food Truck Team</p>
          <p style="font-size: 12px; color: #434342;">Follow us on social media for updates and special offers!</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email to company
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'coitsfte@gmail.com',
      subject: `New Event Booking: ${formData.eventName}`,
      html: companyEmailHtml,
      attachments: [{
        filename: 'logo.png',
        path: './backend/logo.png',
        cid: 'logo'
      }],
      // Providing plain text version as fallback
      text: emailContent
    });

    // Send confirmation email to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: formData.email,
      subject: 'Event Booking Request Received - Coit\'s Food Truck',
      html: customerEmailHtml,
      attachments: [{
        filename: 'logo.png',
        path: './backend/logo.png',
        cid: 'logo'
      }],
      // Providing plain text version as fallback
      text: `${formData.fullName},

Thank you for your event booking request! We're excited about the possibility of being part of your event.

Event Details:
• Event: ${formData.eventName}
• Date: ${formData.eventDate}
• Time: ${formatTimeToAMPM(formData.eventStartTime)} to ${formatTimeToAMPM(formData.eventEndTime)}
• Location: ${formData.eventAddress}
• Other Food Trucks at Event: ${formData.otherFoodTrucks === 'yes' ? 'Yes' : 'No'}

We will review your request and respond within a week. If you have any immediate questions, please reply to this email.

Best regards,
The Coit's Food Truck Team`
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
} 