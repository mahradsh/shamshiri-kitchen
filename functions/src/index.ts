import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";
import * as https from "https";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Twilio configuration
const TWILIO_ACCOUNT_SID = "AC48b87abefaa08515d6d84e9184491a71";
const TWILIO_AUTH_TOKEN = "91dd23b5c7830ecdc519dd1c973c2471";
const TWILIO_PHONE_NUMBER = "+14165784000";

/**
 * Order item interface
 */
interface OrderItem {
  itemName: string;
  quantity: number;
}

/**
 * Send SMS via Twilio
 * @param {string} phoneNumber - Phone number to send to
 * @param {string} message - Message to send
 * @return {Promise<boolean>} - Success status
 */
async function sendSMS(phoneNumber: string, message: string):
  Promise<boolean> {
  return new Promise((resolve) => {
    const auth = Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
    ).toString("base64");
    const postData = new URLSearchParams({
      From: TWILIO_PHONE_NUMBER,
      To: phoneNumber,
      Body: message,
    }).toString();

    const options = {
      hostname: "api.twilio.com",
      port: 443,
      path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        if (res.statusCode === 201) {
          logger.info(`SMS sent successfully to ${phoneNumber}`);
          resolve(true);
        } else {
          logger.error(`SMS failed to ${phoneNumber}:`, data);
          resolve(false);
        }
      });
    });

    req.on("error", (error) => {
      logger.error(`SMS error for ${phoneNumber}:`, error);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Format phone number for Twilio
 * @param {string} phoneNumber - Raw phone number
 * @return {string} - Formatted phone number
 */
function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  let formatted = phoneNumber.trim();

  if (cleaned.length === 10 && !formatted.startsWith("+")) {
    formatted = "+1" + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith("1") &&
             !formatted.startsWith("+")) {
    formatted = "+" + cleaned;
  }

  return formatted;
}

/**
 * Process new order and send notifications
 */
export const processNewOrder = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    try {
      const orderData = event.data?.data();
      if (!orderData) {
        logger.error("No order data found");
        return;
      }

      logger.info(`Processing new order: ${orderData.orderNumber}`);

      // Load notification settings
      const settingsSnapshot = await db.collection("settings").limit(1).get();
      if (settingsSnapshot.empty) {
        logger.info("No notification settings found, skipping notifications");
        return;
      }

      const settings = settingsSnapshot.docs[0].data();

      // Format dates for notifications
      const deliveryDate = new Date(orderData.orderDate.toDate());
      const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const orderPlacedDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Format items for notifications
      const itemsList = orderData.items.map((item: OrderItem) =>
        `${item.itemName} (${item.quantity})`
      ).join("\n");

      // Send SMS notifications
      if (settings.smsEnabled && settings.phoneNumbers &&
          settings.phoneNumbers.length > 0) {
        logger.info(`Sending SMS to ${settings.phoneNumbers.length} numbers`);

        const smsMessage = `🍽️ NEW ORDER ALERT 🍽️

Order #${orderData.orderNumber}
Delivery: ${formattedDeliveryDate}
Location: ${orderData.location}
Placed by: ${orderData.placedByName}

Items ordered:
${itemsList}

${orderData.staffNote ? `Notes: ${orderData.staffNote}\n` : ""}Please check the admin panel for details.

- Shamshiri Kitchen System`;

        const smsPromises = settings.phoneNumbers.map(
          async (phoneNumber: string) => {
            if (!phoneNumber.trim()) return;

            const formattedPhone = formatPhoneNumber(phoneNumber.trim());
            return await sendSMS(formattedPhone, smsMessage);
          }
        );

        await Promise.all(smsPromises);
      }

      // Send email notifications via Firebase Extension
      if (settings.emailEnabled && settings.emailAddresses &&
          settings.emailAddresses.length > 0) {
        logger.info(
          `Creating email document for ${settings.emailAddresses.length} addresses`
        );

        const itemsText = orderData.items.map((item: OrderItem) =>
          `• ${item.itemName} - Quantity: ${item.quantity}`
        ).join("\n");

        const itemsHtml = orderData.items.map((item: OrderItem) =>
          `<li><strong>${item.itemName}</strong> - Quantity: ${item.quantity}</li>`
        ).join("");

        const emailData = {
          to: settings.emailAddresses,
          message: {
            subject: `🍽️ New Order #${orderData.orderNumber} - ${orderData.location}`,
            text: `NEW ORDER NOTIFICATION

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: #${orderData.orderNumber}
Delivery Date: ${formattedDeliveryDate}
Location: ${orderData.location}
Placed by: ${orderData.placedByName}
Order Placed: ${orderPlacedDate}

Items Ordered:
${itemsText}

${orderData.staffNote ? `Staff Notes:\n${orderData.staffNote}\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please check the admin panel for full details and to manage this order.

Best regards,
Shamshiri Kitchen Management System`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #b32127; text-align: center; margin-bottom: 30px;">
                🍽️ New Order Notification
              </h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
                <p><strong>Delivery Date:</strong> ${formattedDeliveryDate}</p>
                <p><strong>Location:</strong> ${orderData.location}</p>
                <p><strong>Placed By:</strong> ${orderData.placedByName}</p>
                <p><strong>Order Placed:</strong> ${orderPlacedDate}</p>
              </div>
              
              <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-top: 0;">Items Ordered</h3>
                <ul style="padding-left: 20px;">
                  ${itemsHtml}
                </ul>
              </div>
              
              ${orderData.staffNote ? `
                <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="color: #333; margin-top: 0;">Staff Notes</h3>
                  <p style="margin: 0; white-space: pre-wrap;">${orderData.staffNote}</p>
                </div>
              ` : ""}
              
              <div style="text-align: center; margin-top: 30px; color: #666;">
                <p>This is an automated notification from Shamshiri Kitchen ordering system.</p>
                <p>Please check the admin panel for full details and to manage this order.</p>
              </div>
            </div>
            `,
          },
        };

        // Create email document for Firebase Extension to process
        await db.collection("mail").add(emailData);
        logger.info(`Email document created for order ${orderData.orderNumber}`);
      }

      logger.info(
        `Successfully processed notifications for order ${orderData.orderNumber}`
      );
    } catch (error) {
      logger.error("Error processing new order:", error);
    }
  }
);
