/** Theme-aligned default bodies. Outer branded shell is applied in `wrapEmailHtml`. */

const fieldRow = (label: string, value: string, last = false) => `<tr>
  <td style="padding:14px 18px;${last ? "" : "border-bottom:1px solid #e4ddd2;"}width:148px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#a66b2e;font-family:Arial,Helvetica,sans-serif;vertical-align:top">${label}</td>
  <td style="padding:14px 18px;${last ? "" : "border-bottom:1px solid #e4ddd2;"}font-size:15px;line-height:1.65;color:#2c241c;font-family:Georgia,'Times New Roman',serif;vertical-align:top;white-space:pre-wrap">${value}</td>
</tr>`;

const fieldCard = (rows: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e4ddd2;background:#fbf8f2">
  <tr>
    <td style="width:4px;background:#a66b2e;font-size:0;line-height:0">&nbsp;</td>
    <td style="padding:0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows}</table>
    </td>
  </tr>
</table>`;

export const DEFAULT_EMAIL_TEMPLATES = {
  contactAdminSubject: "New contact from {{name}}",
  contactAdminHtml: `<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#6f6559;font-family:Georgia,'Times New Roman',serif">A new message arrived through the contact form.</p>
${fieldCard(
  [
    fieldRow("Name", "{{name}}"),
    fieldRow("Email", '<a href="mailto:{{email}}" style="color:#a66b2e;text-decoration:none">{{email}}</a>'),
    fieldRow("Phone", "{{phone}}"),
    fieldRow("Company", "{{company}}"),
    fieldRow("Message", "{{message}}", true),
  ].join(""),
)}`,

  contactCustomerSubject: "We received your message — {{siteName}}",
  contactCustomerHtml: `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#2c241c;font-family:Georgia,'Times New Roman',serif">Hi {{name}},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#6f6559;font-family:Georgia,'Times New Roman',serif">Thanks for writing to <strong style="color:#2c241c">{{siteName}}</strong>. Our team reviews every enquiry personally and will reply within one business day.</p>
<p style="margin:0 0 10px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a66b2e;font-family:Arial,Helvetica,sans-serif">Your message</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 22px">
  <tr>
    <td style="padding:16px 18px;border:1px solid #e4ddd2;border-left:4px solid #a66b2e;background:#fbf8f2;font-size:15px;line-height:1.7;color:#2c241c;font-family:Georgia,'Times New Roman',serif;white-space:pre-wrap">{{message}}</td>
  </tr>
</table>
<p style="margin:0;font-size:15px;line-height:1.7;color:#6f6559;font-family:Georgia,'Times New Roman',serif">— {{siteName}}</p>`,

  inquiryAdminSubject: "New {{inquiryType}} — {{subjectName}}",
  inquiryAdminHtml: `<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#6f6559;font-family:Georgia,'Times New Roman',serif">A new project enquiry arrived for <strong style="color:#2c241c">{{subjectName}}</strong>.</p>
${fieldCard(
  [
    fieldRow("Name", "{{name}}"),
    fieldRow("Email", '<a href="mailto:{{email}}" style="color:#a66b2e;text-decoration:none">{{email}}</a>'),
    fieldRow("Phone", "{{phone}}"),
    fieldRow("Company", "{{company}}"),
    fieldRow("Enquiry", "{{inquiryType}} · {{subjectName}}"),
    fieldRow("Package", "{{selectedPackage}}"),
    fieldRow("Budget", "{{budget}}"),
    fieldRow("Timeline", "{{timeline}}"),
    fieldRow("Source", "{{source}}"),
    fieldRow("Message", "{{message}}", true),
  ].join(""),
)}`,

  inquiryCustomerSubject: "Thanks for your enquiry — {{siteName}}",
  inquiryCustomerHtml: `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#2c241c;font-family:Georgia,'Times New Roman',serif">Hi {{name}},</p>
<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#6f6559;font-family:Georgia,'Times New Roman',serif">Thanks for enquiring about <strong style="color:#2c241c">{{subjectName}}</strong>. We’ve received your details and a producer will follow up shortly.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 22px;border:1px solid #e4ddd2;background:#fbf8f2">
  <tr>
    <td style="padding:16px 18px">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a66b2e;font-family:Arial,Helvetica,sans-serif">Enquiry summary</p>
      <p style="margin:0;font-size:15px;line-height:1.65;color:#2c241c;font-family:Georgia,'Times New Roman',serif"><strong>{{subjectName}}</strong></p>
      <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#6f6559;font-family:Georgia,'Times New Roman',serif">{{enquirySummary}}</p>
    </td>
  </tr>
</table>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#6f6559;font-family:Georgia,'Times New Roman',serif">If you need to add anything, reply to this email.</p>
<p style="margin:0;font-size:15px;line-height:1.7;color:#6f6559;font-family:Georgia,'Times New Roman',serif">— {{siteName}}</p>`,
} as const;
