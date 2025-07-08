import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SMS TEST ENDPOINT ===');
    
    // Test the exact credentials you provided
    const accountSid = 'AC48b87abefaa08515d6d84e9184491a71';
    const authToken = 'ecacfa05f039620304eecdf4202132e1';
    const phoneNumber = '+14165784000';
    
    console.log('Testing Twilio credentials:', {
      accountSid: accountSid.substring(0, 8) + '...',
      authToken: authToken ? 'Set (' + authToken.length + ' chars)' : 'Missing',
      phoneNumber
    });
    
    // Try to initialize Twilio client
    const client = twilio(accountSid, authToken);
    
    // Test by fetching account info (this will verify credentials)
    const account = await client.api.accounts(accountSid).fetch();
    
    console.log('Account verification successful:', {
      sid: account.sid,
      friendlyName: account.friendlyName,
      status: account.status
    });
    
    return NextResponse.json({
      success: true,
      message: 'Twilio credentials are valid',
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status
      },
      phoneNumber
    });
    
  } catch (error: any) {
    console.error('Twilio test failed:', {
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status,
      suggestion: error.code === 20003 ? 'Invalid credentials - check Account SID and Auth Token' : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testPhoneNumber } = await request.json();
    
    if (!testPhoneNumber) {
      return NextResponse.json({ error: 'testPhoneNumber is required' }, { status: 400 });
    }
    
    console.log('=== SENDING TEST SMS ===');
    
    const accountSid = 'AC48b87abefaa08515d6d84e9184491a71';
    const authToken = 'ecacfa05f039620304eecdf4202132e1';
    const fromNumber = '+14165784000';
    
    const client = twilio(accountSid, authToken);
    
    const message = `🧪 TEST MESSAGE from Shamshiri Kitchen
    
This is a test SMS to verify Twilio integration is working.
    
Time: ${new Date().toLocaleString()}
    
If you received this, SMS is working! 🎉`;
    
    console.log('Sending test SMS:', {
      to: testPhoneNumber,
      from: fromNumber,
      messageLength: message.length
    });
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: testPhoneNumber
    });
    
    console.log('Test SMS sent successfully:', {
      messageSid: result.sid,
      status: result.status,
      to: testPhoneNumber
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test SMS sent successfully',
      messageSid: result.sid,
      status: result.status,
      sentTo: testPhoneNumber
    });
    
  } catch (error: any) {
    console.error('Test SMS failed:', {
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status
    }, { status: 500 });
  }
} 