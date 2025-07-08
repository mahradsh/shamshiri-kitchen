import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Get Twilio configuration - check multiple sources
function getTwilioConfig() {
  // Try environment variables first
  let accountSid = process.env.TWILIO_ACCOUNT_SID;
  let authToken = process.env.TWILIO_AUTH_TOKEN;
  let phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  // Fallback to your known credentials if env vars not available
  if (!accountSid || !authToken) {
    console.log('Environment variables not found, using fallback credentials');
    accountSid = 'AC48b87abefaa08515d6d84e9184491a71';
    authToken = 'ecacfa05f039620304eecdf4202132e1';
    phoneNumber = '+14165784000';
  }

  return {
    accountSid,
    authToken,
    phoneNumber: phoneNumber || '+14165784000'
  };
}

const { accountSid, authToken, phoneNumber: twilioNumber } = getTwilioConfig();

// Initialize Twilio client
let client: any = null;
try {
  if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
}

export async function POST(request: NextRequest) {
  try {
    console.log('SMS API called - checking Twilio configuration');
    console.log('Config status:', {
      accountSid: accountSid ? `Set (${accountSid.substring(0, 8)}...)` : 'Missing',
      authToken: authToken ? 'Set' : 'Missing',
      twilioNumber: twilioNumber || 'Missing',
      clientStatus: client ? 'Initialized' : 'Not initialized'
    });

    // Validate Twilio client
    if (!client) {
      console.error('Twilio client not initialized');
      return NextResponse.json({ 
        error: 'SMS service not properly configured' 
      }, { status: 500 });
    }

    const { 
      phoneNumber, 
      orderNumber, 
      location, 
      placedBy, 
      orderItems, 
      staffNote, 
      deliveryDate 
    } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Validate phone number format
    const phoneRegex = /^\+?1?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Format order items for SMS
    const itemsList = orderItems ? orderItems.map((item: any) => `${item.name} (${item.quantity})`).join('\n') : '';
    
    // Format delivery date
    const formattedDate = new Date(deliveryDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    const message = `🍽️ NEW ORDER ALERT 🍽️

Order #${orderNumber}
Delivery: ${formattedDate}
Location: ${location}
Placed by: ${placedBy}

Items ordered:
${itemsList}

${staffNote ? `Notes: ${staffNote}\n` : ''}Please check the admin panel for details.

- Shamshiri Kitchen System`;

    console.log('Attempting to send SMS:', {
      to: phoneNumber,
      from: twilioNumber,
      messageLength: message.length
    });

    const result = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: phoneNumber
    });

    console.log('SMS sent successfully:', {
      messageSid: result.sid,
      status: result.status,
      to: phoneNumber
    });

    return NextResponse.json({ 
      success: true, 
      messageSid: result.sid,
      status: result.status
    });

  } catch (error: any) {
    console.error('Error sending SMS:', {
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status,
      details: error.details
    });
    
    return NextResponse.json({ 
      error: 'Failed to send SMS notification',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
} 