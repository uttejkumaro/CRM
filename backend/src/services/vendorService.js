import axios from "axios";

export async function callVendorSend(message, commLogId) {
  try {
    const resp = await axios.post(
      process.env.VENDOR_CALLBACK_URL.replace("/receipt", "/send"),
      { commLogId, message },
      { timeout: 10000 }
    );
    return resp.data;
  } catch (err) {
    return { status: "ERROR", error: err.message };
  }
}
