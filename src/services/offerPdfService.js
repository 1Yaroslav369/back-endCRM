import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FONTS
const regularFont = path.join(__dirname, '../../fonts/DejaVuSans.ttf');

const boldFont = path.join(__dirname, '../../fonts/DejaVuSans-Bold.ttf');

// Check fonts exist
if (!fs.existsSync(regularFont)) {
  throw new Error(`Regular font not found: ${regularFont}`);
}

if (!fs.existsSync(boldFont)) {
  throw new Error(`Bold font not found: ${boldFont}`);
}

// HELPERS
const sanitizeFileName = (name) => {
  return String(name || 'client')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/gi, 'l')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
};

const formatDate = (date) => {
  if (!date) {
    return '-';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();

  return `${day}.${month}.${year}`;
};

const formatMoney = (value) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return '0.00';
  }

  return number.toFixed(2);
};

// PDF
export const generateOfferPdf = (offer, res) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    autoFirstPage: true,
  });

  // RESPONSE
  const clientName = sanitizeFileName(offer.client_name);

  res.setHeader('Content-Type', 'application/pdf');

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="oferta-${offer.id}-${clientName}.pdf"`,
  );

  doc.pipe(res);

  // CONSTANTS
  const pageWidth = 595.28;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  const dark = '#1F2937';
  const gray = '#6B7280';
  const lightGray = '#F3F4F6';
  const border = '#D1D5DB';

  // HEADER
  doc
    .font(boldFont)
    .fontSize(12)
    .fillColor(dark)
    .text('SYSTEM CRM', margin, 45);

  doc.font(boldFont).fontSize(26).fillColor(dark).text('OFERTA', margin, 75, {
    width: contentWidth,
    align: 'center',
  });

  // Offer number
  doc
    .font(regularFont)
    .fontSize(10)
    .fillColor(gray)
    .text(`Oferta nr ${offer.id}`, margin, 115, {
      width: contentWidth / 2,
      align: 'left',
    });

  // Date
  doc.text(
    `Data: ${formatDate(offer.created_at)}`,
    margin + contentWidth / 2,
    115,
    {
      width: contentWidth / 2,
      align: 'right',
    },
  );

  // Header line
  doc
    .moveTo(margin, 138)
    .lineTo(margin + contentWidth, 138)
    .lineWidth(1)
    .strokeColor(border)
    .stroke();

  // CLIENT
  doc.font(boldFont).fontSize(15).fillColor(dark).text('KLIENT', margin, 165);

  const clientBoxY = 192;
  const clientBoxHeight = 100;

  // Client box
  doc
    .roundedRect(margin, clientBoxY, contentWidth, clientBoxHeight, 6)
    .lineWidth(1)
    .strokeColor(border)
    .stroke();

  // Client name
  doc
    .font(boldFont)
    .fontSize(12)
    .fillColor(dark)
    .text(String(offer.client_name || '-'), margin + 15, clientBoxY + 16, {
      width: contentWidth - 30,
    });

  // Phone
  doc
    .font(regularFont)
    .fontSize(10)
    .fillColor(gray)
    .text(
      `Telefon: ${String(offer.phone || '-')}`,
      margin + 15,
      clientBoxY + 45,
      {
        width: contentWidth - 30,
      },
    );

  // Email
  doc.text(
    `E-mail: ${String(offer.email || '-')}`,
    margin + 15,
    clientBoxY + 66,
    {
      width: contentWidth - 30,
    },
  );

  // OFFER DETAILS
  doc
    .font(boldFont)
    .fontSize(15)
    .fillColor(dark)
    .text('SZCZEGÓŁY OFERTY', margin, 320);

  const detailsBoxY = 347;
  const detailsBoxHeight = 145;

  // Details box
  doc
    .roundedRect(margin, detailsBoxY, contentWidth, detailsBoxHeight, 6)
    .lineWidth(1)
    .strokeColor(border)
    .stroke();

  // Title label
  doc
    .font(boldFont)
    .fontSize(11)
    .fillColor(dark)
    .text('Tytuł', margin + 15, detailsBoxY + 15);

  // Title
  doc
    .font(regularFont)
    .fontSize(11)
    .fillColor(dark)
    .text(String(offer.title || '-'), margin + 15, detailsBoxY + 35, {
      width: contentWidth - 30,
      height: 30,
      ellipsis: true,
    });

  // Description label
  doc
    .font(boldFont)
    .fontSize(11)
    .fillColor(dark)
    .text('Opis', margin + 15, detailsBoxY + 72);

  // Description
  doc
    .font(regularFont)
    .fontSize(10)
    .fillColor(gray)
    .text(String(offer.description || '-'), margin + 15, detailsBoxY + 92, {
      width: contentWidth - 30,
      height: 35,
      ellipsis: true,
    });

  // FINANCIAL SUMMARY
  doc
    .font(boldFont)
    .fontSize(15)
    .fillColor(dark)
    .text('PODSUMOWANIE FINANSOWE', margin, 525);

  const financeY = 552;
  const financeHeight = 120;

  // Finance background
  doc
    .roundedRect(margin, financeY, contentWidth, financeHeight, 6)
    .fillColor(lightGray)
    .fill();

  // NET
  doc
    .font(regularFont)
    .fontSize(11)
    .fillColor(gray)
    .text('Kwota netto', margin + 15, financeY + 20);

  doc
    .font(boldFont)
    .fontSize(11)
    .fillColor(dark)
    .text(
      `${formatMoney(offer.net_price)} PLN`,
      margin + contentWidth - 170,
      financeY + 20,
      {
        width: 155,
        align: 'right',
      },
    );

  // VAT
  doc
    .font(regularFont)
    .fontSize(11)
    .fillColor(gray)
    .text('VAT', margin + 15, financeY + 50);

  doc
    .font(boldFont)
    .fontSize(11)
    .fillColor(dark)
    .text(
      `${formatMoney(offer.vat)}%`,
      margin + contentWidth - 170,
      financeY + 50,
      {
        width: 155,
        align: 'right',
      },
    );

  // TOTAL
  doc
    .font(boldFont)
    .fontSize(12)
    .fillColor(dark)
    .text('Kwota brutto', margin + 15, financeY + 82);

  doc
    .font(boldFont)
    .fontSize(14)
    .fillColor(dark)
    .text(
      `${formatMoney(offer.total_price)} PLN`,
      margin + contentWidth - 170,
      financeY + 79,
      {
        width: 155,
        align: 'right',
      },
    );

  // VALID UNTIL
  if (offer.valid_until) {
    doc
      .font(regularFont)
      .fontSize(10)
      .fillColor(gray)
      .text(`Oferta ważna do: ${formatDate(offer.valid_until)}`, margin, 695, {
        width: contentWidth,
        align: 'center',
      });
  }

  doc.end();
};
