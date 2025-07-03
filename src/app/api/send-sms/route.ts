import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Use environment variables for security
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC48b87abefaa08515d6d84e9184491a71';
const authToken = process.env.TWILIO_AUTH_TOKEN || '428e047f89ee6a15b59d8864458497b8';
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+14165784000';

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!accountSid || !authToken || !twilioNumber) {
      return NextResponse.json({ 
        error: 'SMS service configuration missing' 
      }, { status: 500 });
    }

    const { 
      phoneNumber, 
      orderNumber, 
      location, 
      itemCount, 
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

    const result = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: phoneNumber
    });

    return NextResponse.json({ 
      success: true, 
      messageSid: result.sid 
    });

  } catch (error) {
    // Don't log sensitive information in production
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.error('Error sending SMS:', error);
    }
    
    return NextResponse.json({ 
      error: 'Failed to send SMS notification' 
    }, { status: 500 });
  }
} 