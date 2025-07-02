import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = 'AC48b87abefaa08515d6d84e9184491a71';
const authToken = '428e047f89ee6a15b59d8864458497b8';
const twilioNumber = '+14165784000';

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, orderNumber, location, itemCount, placedBy, orderItems } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Format order items for SMS
    const itemsList = orderItems ? orderItems.map((item: any) => `${item.name} (${item.quantity})`).join('\n') : '';
    
    const message = `🍽️ NEW ORDER ALERT 🍽️

Order #${orderNumber}
Location: ${location}
Placed by: ${placedBy}

Items ordered:
${itemsList}

Please check the admin panel for details.

- Shamshiri Kitchen`;

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
    console.error('Error sending SMS:', error);
    return NextResponse.json({ 
      error: 'Failed to send SMS notification' 
    }, { status: 500 });
  }
} 