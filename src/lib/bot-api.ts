// Bot API integration for sending employee messages via WhatsApp

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3001";

export async function sendEmployeeMessage(phone: string, message: string, employeeId: string, whatsappAccountId: string) {
  try {
    const response = await fetch(`${BOT_API_URL}/api/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        message,
        employeeId,
        whatsappAccountId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send message");
    }

    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("Error sending message via bot API:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function checkAccountStatus(safeId: string) {
  try {
    const response = await fetch(`${BOT_API_URL}/api/account-status/${safeId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking account status:", error);
    return { online: false, safeId };
  }
}
