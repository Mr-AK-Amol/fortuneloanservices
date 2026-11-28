const PARENT_FOLDER_ID = "1rW3giGG7r856ZPQW1sjLvoT3QrJXhu2V";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Fortune Loan Services | Document Upload")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

/** Called from the Apps Script-hosted upload page via google.script.run. */
function uploadDocuments(payload) {
  validatePayload_(payload);

  const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  const submittedAt = new Date();
  const reference = Utilities.getUuid().split("-")[0].toUpperCase();
  const applicant = safeName_(payload.fullName) || "Applicant";
  const folderName = `${applicant} - ${payload.phone} - ${reference}`;
  const folder = parent.createFolder(folderName);
  folder.setDescription([
    "Fortune Loan Services document submission",
    `Reference: ${reference}`,
    `Applicant: ${payload.fullName}`,
    `Phone: ${payload.phone}`,
    `Category: ${payload.category}`,
    `Loan type: ${payload.loanType}`,
    `Submitted: ${submittedAt.toISOString()}`
  ].join("\n"));

  try {
    payload.files.forEach((file, index) => {
      const bytes = Utilities.base64Decode(file.base64);
      const blob = Utilities.newBlob(bytes, file.mimeType, safeFileName_(file.name));
      const driveFile = folder.createFile(blob);
      driveFile.setDescription(`Document: ${String(file.docName || "Supporting document").slice(0, 150)} | Submission: ${reference}`);
    });
    return { success: true, reference: reference };
  } catch (error) {
    // Remove a partial submission if a file fails to save.
    try { folder.setTrashed(true); } catch (cleanupError) {}
    throw new Error("Drive could not save the complete submission. Please retry or contact the office.");
  }
}

function validatePayload_(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid submission.");
  const name = String(payload.fullName || "").trim();
  const phone = String(payload.phone || "").trim();
  const category = String(payload.category || "").trim();
  const loanType = String(payload.loanType || "").trim();
  if (!name || name.length > 100) throw new Error("Enter a valid full name.");
  if (!/^\d{10}$/.test(phone)) throw new Error("Enter a valid 10-digit mobile number.");
  if (!category || category.length > 80 || !loanType || loanType.length > 100) throw new Error("Choose applicant category and loan type.");
  if (!Array.isArray(payload.files) || payload.files.length < 1 || payload.files.length > 30) throw new Error("Select between 1 and 30 files.");

  let total = 0;
  payload.files.forEach(file => {
    if (!file || typeof file.base64 !== "string") throw new Error("A selected file could not be read.");
    if (!ALLOWED_MIME_TYPES.includes(String(file.mimeType || ""))) throw new Error("Only PDF, JPG, JPEG, and PNG files are accepted.");
    const approxBytes = Math.floor(file.base64.length * 3 / 4);
    if (approxBytes < 1 || approxBytes > MAX_FILE_BYTES) throw new Error("Each file must be no larger than 10 MB.");
    total += approxBytes;
    if (total > MAX_TOTAL_BYTES) throw new Error("Total submission size must be 15 MB or less.");
    if (String(file.name || "").length > 180) throw new Error("A filename is too long.");
  });
}

function safeName_(value) {
  return String(value || "").replace(/[\\/:*?"<>|#%{}~&]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

function safeFileName_(value) {
  const name = String(value || "document").replace(/[\\/:*?"<>|#%{}~&]/g, "_").trim().slice(0, 150);
  return name || "document";
}
