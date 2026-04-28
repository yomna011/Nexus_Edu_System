import nodemailer from "nodemailer";

export async function sendStatusEmail(application: any) {
  const student = application.student;

  const portalLink = `http://localhost:3000/applications/${application._id}`;

  let subject = "";
  let message = "";

  switch (application.status) {
    case "ACCEPTED":
      subject = "🎉 Congratulations! You are Accepted";
      message = `Hi ${student.name},\n\nYou have been ACCEPTED 🎉\n\nCheck your portal: ${portalLink}`;
      break;

    case "UNDER_REVIEW":
      subject = "Your Application is Under Review";
      message = `Hi ${student.name},\n\nYour application is under review.\n\nTrack it: ${portalLink}`;
      break;

    case "REJECTED":
      subject = "Application Status Update";
      message = `Hi ${student.name},\n\nWe regret to inform you that your application was not successful.\n\nDetails: ${portalLink}`;
      break;

    case "WAITLISTED":
      subject = "Application Waitlisted";
      message = `Hi ${student.name},\n\nYou are currently waitlisted.\n\nCheck: ${portalLink}`;
      break;

    default:
      subject = "Application Update";
      message = `Hi ${student.name},\n\nYour status changed to ${application.status}`;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: student.email,
    subject,
    text: message,
  });
  console.log("📧 Email sent successfully to:", student.email);
}