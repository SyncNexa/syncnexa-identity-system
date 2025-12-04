import type { Request, Response } from "express";
import * as cvService from "../services/cv.service.js";
import { sendError } from "../utils/error.js";

export async function getCv(req: Request, res: Response) {
  try {
    const userId =
      (req.params && (req.params.userId as string)) || (req.user as any)?.id;
    if (!userId) return sendError(400, "User id required", res);

    const data = await cvService.assembleCvData(userId);
    const html = cvService.generateHtmlFromData(data);

    const wantsPdf =
      String(req.query.format || "").toLowerCase() === "pdf" ||
      (req.headers.accept || "").includes("application/pdf");

    if (wantsPdf) {
      try {
        const puppeteerModule = await import("puppeteer");
        const puppeteer =
          (puppeteerModule && (puppeteerModule as any).default) ||
          puppeteerModule;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const buffer = await page.pdf({
          format: "A4",
          margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
        });
        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="cv-${userId}.pdf"`
        );
        return res.send(buffer);
      } catch (err) {
        console.error("PDF generation error (puppeteer)", err);
        return sendError(500, "PDF generation failed", res);
      }
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  } catch (err) {
    console.error(err);
    return sendError(500, "Could not generate CV", res);
  }
}

export default { getCv };
