const PARENT_FOLDER_ID = "1rW3giGG7r856ZPQW1sjLvoT3QrJXhu2V";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Fortune Loan Services — Document Upload")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uploadDocuments(payload) {
  try {
    if (!payload || typeof payload !== "object") throw new Error("Invalid form submission.");
    const name = clean_(payload.fullName, 120);
    const phone = String(payload.mobile || "").replace(/\D/g, "");
    const city = clean_(payload.city, 100);
    const category = clean_(payload.category, 60);
    const loanType = clean_(payload.loanType, 120);
    if (!name || !/^[6-9]\d{9}$/.test(phone) || !city || !category || !loanType) {
      throw new Error("Please complete all required fields with valid details.");
    }
    if (!Array.isArray(payload.files) || payload.files.length < 1) {
      throw new Error("Please select at least one document.");
    }
    let total = 0;
    payload.files.forEach(file => {
      const size = Number(file.size || 0);
      total += size;
      if (!file.name || !ALLOWED_MIME_TYPES.includes(file.mimeType)) {
        throw new Error("Only PDF, JPG, and PNG files are accepted.");
      }
      if (size < 1 || size > MAX_FILE_BYTES) throw new Error("Each file must be 5 MB or smaller.");
      if (!file.data) throw new Error("A selected file could not be read. Please select it again.");
    });
    if (total > MAX_TOTAL_BYTES) throw new Error("The combined upload size must be 8 MB or less.");

    const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
    const safeName = name.replace(/[\\/:*?"<>|#%{}~&]/g, "-").trim().slice(0, 80) || "Applicant";
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
    const folder = parent.createFolder(safeName + " - " + phone + " - " + stamp);
    folder.setDescription("Loan document submission. Applicant: " + name + "; Phone: " + phone + "; Loan: " + loanType);

    const fileNames = [];
    payload.files.forEach(file => {
      const bytes = Utilities.base64Decode(file.data);
      const blob = Utilities.newBlob(bytes, file.mimeType, clean_(file.name, 180));
      folder.createFile(blob);
      fileNames.push(file.name);
    });

    const details = [
      "FORTUNE LOAN SERVICES — DOCUMENT SUBMISSION",
      "Submitted: " + new Date().toISOString(),
      "Applicant: " + name,
      "Mobile: " + phone,
      "City: " + city,
      "Applicant category: " + category,
      "Loan type: " + loanType,
      "Additional note: " + clean_(payload.note || "", 1000),
      "Uploaded files: " + fileNames.join(", ")
    ].join("\n");
    folder.createFile("Submission Details.txt", details, MimeType.PLAIN_TEXT);

    return { success: true, message: "Documents uploaded successfully. Our team will review your submission." };
  } catch (err) {
    return { success: false, message: err && err.message ? err.message : "Upload failed. Please try again." };
  }
}

function clean_(value, maxLength) {
  return String(value == null ? "" : value).replace(/[<>]/g, "").trim().slice(0, maxLength);
}
