import * as userModel from "../models/user.model.js";
import academicModel from "../models/academic.model.js";
import studentDocModel from "../models/studentDocument.model.js";
import portfolioModel from "../models/portfolio.model.js";
import studentCardModel from "../models/studentCard.model.js";

function renderHtml(data: any) {
  const { user, academics, documents, projects, certificates, cards } = data;
  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>CV - ${
      user?.first_name || user?.firstName || user?.email || "Student"
    }</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.4; padding: 20px; }
      h1 { margin-bottom: 0; }
      h2 { margin-top: 1.2rem; }
      .section { margin-top: 0.6rem; }
      .meta { color: #666; font-size: 0.9rem }
      ul { margin: 0; padding-left: 1.2rem }
    </style>
  </head>
  <body>
    <h1>${user?.first_name || user?.firstName || user?.email}</h1>
    <div class="meta">${user?.user_email || user?.email || ""} • ${
    user?.user_phone || user?.phone || ""
  }</div>

    <div class="section">
      <h2>Academic Records</h2>
      ${
        academics && academics.length
          ? `<ul>${academics
              .map(
                (a: any) =>
                  `<li><strong>${a.institution}</strong> — ${
                    a.degree || a.program || ""
                  } ${
                    a.matric_number ? `(${a.matric_number})` : ""
                  }<br/><small class=\"meta\">${a.start_date || ""} — ${
                    a.end_date || ""
                  }</small></li>`
              )
              .join("")}</ul>`
          : "<p>No academic records.</p>"
      }
    </div>

    <div class="section">
      <h2>Verified Documents</h2>
      ${
        documents && documents.length
          ? `<ul>${documents
              .map(
                (d: any) =>
                  `<li><strong>${d.doc_type}</strong> — ${
                    d.filename
                  } <small class=\"meta\">${
                    d.is_verified ? "Verified" : "Unverified"
                  }</small></li>`
              )
              .join("")}</ul>`
          : "<p>No documents.</p>"
      }
    </div>

    <div class="section">
      <h2>Projects</h2>
      ${
        projects && projects.length
          ? `<ul>${projects
              .map(
                (p: any) =>
                  `<li><strong>${p.title}</strong><div>${
                    p.description || ""
                  }</div>${
                    p.links
                      ? `<div><small class=\"meta\">Links: ${JSON.stringify(
                          p.links
                        )}</small></div>`
                      : ""
                  }</li>`
              )
              .join("")}</ul>`
          : "<p>No projects.</p>"
      }
    </div>

    <div class="section">
      <h2>Certificates</h2>
      ${
        certificates && certificates.length
          ? `<ul>${certificates
              .map(
                (c: any) =>
                  `<li><strong>${c.title}</strong> — ${
                    c.issuer
                  } <small class=\"meta\">${c.issue_date || ""} • ${
                    c.is_verified ? "Verified" : "Unverified"
                  }</small></li>`
              )
              .join("")}</ul>`
          : "<p>No certificates.</p>"
      }
    </div>

    <div class="section">
      <h2>Digital Cards</h2>
      ${
        cards && cards.length
          ? `<ul>${cards
              .map(
                (c: any) =>
                  `<li>Card: ${c.card_uuid} <small class=\"meta\">Active: ${
                    c.is_active ? "Yes" : "No"
                  }</small></li>`
              )
              .join("")}</ul>`
          : "<p>No cards.</p>"
      }
    </div>

  </body>
  </html>`;
}

export async function assembleCvData(userId: string) {
  const user = await userModel.selectUserById(userId);
  const academics = await academicModel.findAcademicByUser(userId);
  const documents = await studentDocModel.getLatestVerificationForUser(userId);
  const projects = await portfolioModel.findProjectsByUser(userId);
  const certificates = await portfolioModel.findCertificatesByUser(userId);
  const cards = await studentCardModel.findCardByUser(userId);
  return { user, academics, documents, projects, certificates, cards };
}

export function generateHtmlFromData(data: any) {
  return renderHtml(data);
}

// PDF generation will be performed by the controller using installed renderer.
export default { assembleCvData, generateHtmlFromData };
