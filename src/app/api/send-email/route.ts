import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { 
      emailAddress, 
      orderNumber, 
      location, 
      placedBy, 
      orderItems, 
      staffNote, 
      deliveryDate 
    } = await request.json();

    if (!emailAddress) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Format order items for email
    const itemsList = orderItems ? orderItems.map((item: any) => `• ${item.name} (Qty: ${item.quantity})`).join('\n') : '';
    
    // Format delivery date
    const formattedDate = new Date(deliveryDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailBody = `🍽️ NEW ORDER NOTIFICATION 🍽️

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: #${orderNumber}
Delivery Date: ${formattedDate}
Location: ${location}
Placed by: ${placedBy}

Items Ordered:
${itemsList}

${staffNote ? `Staff Notes:\n${staffNote}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please check the admin panel for full details and to manage this order.

Best regards,
Shamshiri Kitchen Management System`;

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Check if we have API key
    if (!process.env.RESEND_API_KEY) {
      // Fallback to logging if no API key
      console.log('📧 EMAIL SIMULATION (No API Key):');
      console.log(`To: ${emailAddress}`);
      console.log(`Subject: New Order #${orderNumber} - ${location}`);
      console.log(`Body:\n${emailBody}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email notification simulated (no API key configured)' 
      });
    }

    try {
      // Send actual email using Resend
      const { data, error } = await resend.emails.send({
        from: 'Shamshiri Kitchen <orders@shamshiri.ca>',
        to: [emailAddress],
        subject: `🍽️ New Order #${orderNumber} - ${location}`,
        text: emailBody,
      });

      if (error) {
        console.error('Resend API error:', error);
        return NextResponse.json({ 
          error: 'Failed to send email notification',
          details: error 
        }, { status: 500 });
      }

      console.log('📧 Email sent successfully:', data);
      return NextResponse.json({ 
        success: true, 
        message: 'Email notification sent successfully',
        emailId: data?.id 
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Fallback to logging
      console.log('📧 EMAIL FALLBACK (Error occurred):');
      console.log(`To: ${emailAddress}`);
      console.log(`Subject: New Order #${orderNumber} - ${location}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email notification logged (send failed)' 
      });
    }

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email notification' 
    }, { status: 500 });
  }
} 