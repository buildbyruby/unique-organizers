"use server"

/**
 * Initiates an M-Pesa STK Push using Safaricom Daraja Sandbox credentials.
 * This function handles both OAuth token generation and the payment request.
 */
export async function initiateSTKPush(phoneNumber: string, amount: number) {
  // 1. Credentials from your provided .env
  const consumerKey = "ZzSpGBy4ZAiklaxhkNrtGpFw4wSGN9kczgmtXWlQ2vs03MSl";
  const consumerSecret = "2d8UWwgQ8XUVueHxJVXfxSFTfEcg4tD4KvmEtszZDVsugD3BQXnXrg8lTrKwh31e";
  const shortCode = "174379";
  const passKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const callbackUrl = "https://gametophoric-an-mystically.ngrok-free.dev/api/mpesa/callback";

  try {
    // 2. Generate Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) throw new Error("Failed to generate M-Pesa access token");

    // 3. Prepare Password & Timestamp
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");

    // 4. Format Phone Number (Ensures it starts with 254)
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("254")
      ? cleanPhone
      : "254" + cleanPhone.slice(-9);

    // 5. Initiate STK Push Request
    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: 1, // Sandbox usually requires KES 1 for testing
          PartyA: formattedPhone,
          PartyB: shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: "7831385",
          TransactionDesc: "Unique Organizers Order",
        }),
      }
    );

    const data = await stkResponse.json();
    console.log("M-Pesa Sandbox Response:", data);

    return data;
  } catch (error) {
    console.error("Critical M-Pesa Error:", error);
    return { success: false, message: "Internal Server Error" };
  }
}