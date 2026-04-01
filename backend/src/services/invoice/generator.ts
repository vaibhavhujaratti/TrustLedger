import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateInvoicePdf(invoiceNumber: string, metadata: any): Promise<string> {
  // Using PDF lib to generate a robust PDF safely storing standard bytes without heavy headless drivers
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  
  const { width, height } = page.getSize();
  const fontSize = 16;
  
  page.drawText('Trust-Bound Escrow Invoice', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize + 10,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Invoice Number: ${invoiceNumber}`, {
    x: 50,
    y: height - 7 * fontSize,
    size: fontSize,
    font: timesRomanFont,
  });

  page.drawText(`Client: ${metadata.client}`, {
    x: 50,
    y: height - 10 * fontSize,
    size: fontSize,
    font: timesRomanFont,
  });

  page.drawText(`Freelancer: ${metadata.freelancer}`, {
    x: 50,
    y: height - 12 * fontSize,
    size: fontSize,
    font: timesRomanFont,
  });

  page.drawText(`Total Amount: ${metadata.amount} INR`, {
    x: 50,
    y: height - 16 * fontSize,
    size: fontSize,
    font: timesRomanFont,
  });

  const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
  return pdfBytes;
}
