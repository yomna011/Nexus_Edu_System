import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import { calculateGPA } from '@/lib/gpa';

// ─── Grade → quality points ────────────────────────────────────────────────
function gradeToPoints(grade: string, isHonors = false): number | null {
  const map: Record<string, number> = {
    'A+': 4.0, A: 4.0, 'A-': 3.7,
    'B+': 3.3, B: 3.0, 'B-': 2.7,
    'C+': 2.3, C: 2.0, 'C-': 1.7,
    'D+': 1.3, D: 1.0, F: 0.0,
  };
  const g = grade.toUpperCase();
  if (!(g in map)) return null;
  let p = map[g];
  if (isHonors && p > 0) p += 0.5;
  return p;
}

// ─── Collect PDFDocument stream into a Buffer ──────────────────────────────
function streamToBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

// ─── Colours (RGB 0-255) ────────────────────────────────────────────────────
const NAVY  = '#0A2E6B';
const GOLD  = '#C29922';
const DGRAY = '#4D4D4D';
const LGRAY = '#EBEBEB';
const WHITE = '#FFFFFF';
const RED   = '#BF0000';
const PALE_BLUE = '#E8EDF8';

export async function GET(
  _req: Request,
  { params }: any,
) {
  try {
    await dbConnect();
    const { id } = await params;

    // ── 1. Student ─────────────────────────────────────────────────────────
    const student = await User.findOne({ _id: id, role: 'STUDENT' })
      .populate('department', 'name code')
      .lean() as any;

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // ── 2. Enrollments ─────────────────────────────────────────────────────
    const enrollments = await Enrollment.find({ student: id })
      .populate({ path: 'course',   select: 'code title creditHours type isHonors' })
      .populate({ path: 'semester', select: 'name termType academicYear' })
      .lean() as any[];

    // ── 3. Group by semester ───────────────────────────────────────────────
    type SemGroup = {
      semesterName: string;
      order: string;               // for sorting: "2024-FALL" etc.
      rows: {
        code: string; title: string; credits: number;
        grade: string; points: number | null;
      }[];
    };
    const semMap = new Map<string, SemGroup>();

    for (const e of enrollments) {
      if (!e.grade || !e.course || !e.semester) continue;
      const key = e.semester._id.toString();
      if (!semMap.has(key)) {
        semMap.set(key, {
          semesterName: `${e.semester.termType} ${e.semester.academicYear}`,
          order: `${e.semester.academicYear}-${e.semester.termType}`,
          rows: [],
        });
      }
      semMap.get(key)!.rows.push({
        code:   e.course.code,
        title:  e.course.title,
        credits: e.course.creditHours,
        grade:  e.grade,
        points: gradeToPoints(e.grade, e.course.isHonors),
      });
    }

    // Sort semesters chronologically
    const semesters = [...semMap.values()].sort((a, b) => a.order.localeCompare(b.order));

    // Cumulative stats
    const cumulativeGpa = calculateGPA(
      enrollments
        .filter((e) => e.grade && e.course)
        .map((e) => ({
          grade:  e.grade,
          course: { creditHours: e.course.creditHours, isHonors: e.course.isHonors },
        })),
    );
    const totalCredits = enrollments
      .filter((e) => e.grade && e.course && e.grade.toUpperCase() !== 'F')
      .reduce((s: number, e: any) => s + (e.course?.creditHours ?? 0), 0);

    // ── 4. Generate PDF ────────────────────────────────────────────────────
    const OWNER_PW = process.env.TRANSCRIPT_OWNER_PASSWORD || 'nexus-admin-owner';
    const USER_PW  = process.env.TRANSCRIPT_USER_PASSWORD  || 'NexusOfficial2025';

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 115, bottom: 60, left: 50, right: 50 },
      info: {
        Title:    `Official Transcript – ${student.name}`,
        Author:   'Nexus University Registrar',
        Subject:  'Official Academic Transcript',
        Keywords: 'transcript,official,nexus,university',
        Creator:  'Nexus Edu System – Administrative Portal',
      },
      pdfVersion: '1.7',
      userPassword:  USER_PW,
      ownerPassword: OWNER_PW,
      permissions: {
        printing:        'highResolution',
        modifying:       false,
        copying:         false,
        annotating:      false,
        fillingForms:    false,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });

    const issuedAt = new Date();
    const docId    = `TXN-${Date.now().toString(36).toUpperCase()}`;
    const PAGE_W   = doc.page.width;
    const MARGIN   = 50;
    const COL_W    = PAGE_W - 2 * MARGIN;

    // ─── Helper lambdas ─────────────────────────────────────────────────
    const drawHRule = (y: number, color = GOLD, thickness = 1) => {
      doc.save().moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y)
        .lineWidth(thickness).strokeColor(color).stroke().restore();
    };

    const fillRect = (x: number, y: number, w: number, h: number, color: string) => {
      doc.save().rect(x, y, w, h).fill(color).restore();
    };

    // ─── WATERMARK ────────────────────────────────────────────────────────
    const addWatermark = () => {
      doc.save();
      doc.opacity(0.06);
      doc.fontSize(62).font('Helvetica-Bold').fillColor(NAVY);
      doc.rotate(-45, { origin: [PAGE_W / 2, doc.page.height / 2] });
      const wText = 'OFFICIAL TRANSCRIPT';
      const wW = doc.widthOfString(wText);
      doc.text(wText, (PAGE_W - wW) / 2, doc.page.height / 2 - 31);
      doc.restore();
    };

    // ─── HEADER ───────────────────────────────────────────────────────────
    const drawHeader = () => {
      // Navy banner
      fillRect(0, 0, PAGE_W, 100, NAVY);
      // Gold stripe below banner
      fillRect(0, 100, PAGE_W, 5, GOLD);

      doc.save();
      doc.fontSize(20).font('Helvetica-Bold').fillColor(WHITE);
      doc.text('NEXUS UNIVERSITY', MARGIN, 22);
      doc.fontSize(8).font('Helvetica').fillColor('#BDD0F5');
      doc.text("REGISTRAR'S OFFICE  •  OFFICIAL ACADEMIC TRANSCRIPT", MARGIN, 50);

      // Issue stamp – right side
      const stamp = `Issued: ${issuedAt.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}`;
      const docIdLine = `Document ID: ${docId}`;
      doc.fontSize(7.5).font('Helvetica').fillColor('#BDD0F5');
      doc.text(stamp,     MARGIN, 22, { width: COL_W, align: 'right' });
      doc.text(docIdLine, MARGIN, 36, { width: COL_W, align: 'right' });
      doc.restore();
    };

    // Add watermark & header to first page
    addWatermark();
    drawHeader();

    // ─── STUDENT INFO BOX ─────────────────────────────────────────────────
    const dept     = (student.department as any)?.name ?? 'N/A';
    const deptCode = (student.department as any)?.code ?? '';
    const deptFull = dept + (deptCode ? ` (${deptCode})` : '');

    let curY = 118;

    fillRect(MARGIN, curY, COL_W, 74, LGRAY);
    doc.save().rect(MARGIN, curY, COL_W, 74).lineWidth(0.5).strokeColor('#C0C0C0').stroke().restore();

    doc.save().fontSize(8).font('Helvetica-Bold').fillColor(NAVY);
    doc.text('STUDENT INFORMATION', MARGIN + 8, curY + 8);
    doc.restore();

    const infoLeftCol  = MARGIN + 8;
    const infoRightCol = MARGIN + COL_W / 2 + 8;
    const info = [
      [['Full Name', student.name],         ['Department', deptFull]],
      [['Student ID', student._id.toString()], ['National ID', student.nationalId ?? 'N/A']],
      [['Email', student.email],             ['Status', student.forcePasswordChange ? 'Pending Setup' : 'Active']],
    ];

    let infoY = curY + 22;
    for (const row of info) {
      for (const [i, [label, val]] of row.entries()) {
        const x = i === 0 ? infoLeftCol : infoRightCol;
        doc.save().fontSize(7).font('Helvetica-Bold').fillColor(DGRAY).text(`${label}:`, x, infoY).restore();
        doc.save().fontSize(7.5).font('Helvetica').fillColor('#1A1A1A').text(String(val), x + 62, infoY).restore();
      }
      infoY += 15;
    }

    curY += 84;

    // ─── SECTION TITLE ────────────────────────────────────────────────────
    doc.save().fontSize(11).font('Helvetica-Bold').fillColor(NAVY);
    doc.text('ACADEMIC RECORD', MARGIN, curY);
    doc.restore();
    drawHRule(curY + 16, GOLD, 1.5);
    curY += 22;

    // ─── TABLE LAYOUT ─────────────────────────────────────────────────────
    const COL_CODE    = MARGIN;
    const COL_TITLE   = MARGIN + 68;
    const COL_CREDITS = PAGE_W - MARGIN - 110;
    const COL_GRADE   = PAGE_W - MARGIN - 65;
    const COL_POINTS  = PAGE_W - MARGIN - 28;
    const ROW_H = 14;
    const HDR_H = 15;

    if (semesters.length === 0) {
      doc.save().fontSize(10).font('Helvetica-Oblique').fillColor(DGRAY).text('No graded courses found.', MARGIN, curY).restore();
      curY += 20;
    }

    for (const sem of semesters) {
      // Check if we need a new page (leave room for at least header + 2 rows + summary)
      const needed = 20 + HDR_H + (sem.rows.length * ROW_H) + 20;
      if (curY + needed > doc.page.height - 80) {
        doc.addPage();
        addWatermark();
        drawHeader();
        curY = 118;
      }

      // Semester header
      fillRect(MARGIN, curY, COL_W, 18, NAVY);
      doc.save().fontSize(8.5).font('Helvetica-Bold').fillColor(WHITE);
      doc.text(sem.semesterName.toUpperCase(), MARGIN + 8, curY + 5);
      doc.restore();
      curY += 20;

      // Column headers
      fillRect(MARGIN, curY, COL_W, HDR_H, PALE_BLUE);
      doc.save().fontSize(7).font('Helvetica-Bold').fillColor(NAVY);
      doc.text('Course Code',  COL_CODE    + 4, curY + 4);
      doc.text('Course Title', COL_TITLE,       curY + 4);
      doc.text('Credits',      COL_CREDITS,     curY + 4);
      doc.text('Grade',        COL_GRADE,       curY + 4);
      doc.text('Pts',          COL_POINTS,      curY + 4);
      doc.restore();
      curY += HDR_H;

      // Data rows
      let alt = false;
      for (const row of sem.rows) {
        if (alt) fillRect(MARGIN, curY, COL_W, ROW_H, '#F7F7F7');
        const isFail  = row.grade.toUpperCase() === 'F';
        const textClr = isFail ? RED : '#1A1A1A';
        const titleTrunc = row.title.length > 40 ? row.title.slice(0, 40) + '…' : row.title;
        doc.save().fontSize(7.5).font('Helvetica').fillColor(textClr);
        doc.text(row.code,            COL_CODE    + 4, curY + 3);
        doc.text(titleTrunc,          COL_TITLE,       curY + 3);
        doc.text(String(row.credits), COL_CREDITS,     curY + 3);
        doc.font(isFail ? 'Helvetica-Bold' : 'Helvetica').text(row.grade, COL_GRADE, curY + 3);
        doc.font('Helvetica').text(
          row.points !== null ? row.points.toFixed(1) : '—', COL_POINTS, curY + 3,
        );
        doc.restore();

        // Thin separator
        doc.save().moveTo(MARGIN, curY + ROW_H).lineTo(PAGE_W - MARGIN, curY + ROW_H)
          .lineWidth(0.3).strokeColor('#DCDCDC').stroke().restore();

        curY += ROW_H;
        alt = !alt;
      }

      // Semester GPA sub-row
      const semGpa = calculateGPA(
        sem.rows.map((r) => ({ grade: r.grade, course: { creditHours: r.credits, isHonors: false } })),
      );
      fillRect(MARGIN, curY, COL_W, 16, '#EDEEF8');
      doc.save().fontSize(7.5).font('Helvetica-Bold').fillColor(NAVY);
      doc.text(`Semester GPA: ${semGpa.toFixed(2)}`, MARGIN + 8, curY + 4, { width: COL_W - 16, align: 'right' });
      doc.restore();
      curY += 24;
    }

    // ─── CUMULATIVE SUMMARY BOX ───────────────────────────────────────────
    if (curY + 70 > doc.page.height - 80) {
      doc.addPage();
      addWatermark();
      drawHeader();
      curY = 118;
    }

    curY += 8;
    fillRect(MARGIN, curY, COL_W, 62, NAVY);
    doc.save().rect(MARGIN, curY, COL_W, 62).lineWidth(1.5).strokeColor(GOLD).stroke().restore();

    doc.save().fontSize(9).font('Helvetica-Bold').fillColor(WHITE);
    doc.text('CUMULATIVE ACADEMIC SUMMARY', MARGIN + 10, curY + 10);
    doc.restore();

    const summaryItems: [string, string][] = [
      ['Total Credit Hours Earned', `${totalCredits} credits`],
      ['Cumulative GPA (4.0 scale)', cumulativeGpa.toFixed(2)],
      ['Academic Standing', cumulativeGpa >= 3.5 ? "Dean's List" : cumulativeGpa >= 2.0 ? 'Good Standing' : 'Academic Probation'],
    ];
    const colSpan = COL_W / 3;
    for (const [i, [label, val]] of summaryItems.entries()) {
      const sx = MARGIN + 10 + i * colSpan;
      doc.save().fontSize(7.5).font('Helvetica-Bold').fillColor(GOLD).text(label, sx, curY + 28, { width: colSpan - 10 }).restore();
      doc.save().fontSize(10).font('Helvetica-Bold').fillColor(WHITE).text(val, sx, curY + 43, { width: colSpan - 10 }).restore();
    }
    curY += 72;

    // ─── FOOTER ───────────────────────────────────────────────────────────
    const footerY = doc.page.height - 55;
    drawHRule(footerY, GOLD, 0.5);
    doc.save().fontSize(7).font('Helvetica-Oblique').fillColor(DGRAY);
    doc.text('This document is computer-generated and valid without a physical signature.', MARGIN, footerY + 8, { width: COL_W });
    doc.restore();
    doc.save().fontSize(6.5).font('Helvetica').fillColor(DGRAY);
    doc.text(`Nexus University Registrar's Office  •  ${docId}  •  ${issuedAt.toISOString()}`, MARGIN, footerY + 18, { width: COL_W });
    doc.restore();
    doc.save().fontSize(6.5).font('Helvetica-Bold').fillColor(RED);
    doc.text('CONFIDENTIAL – For official use only. Unauthorised reproduction is prohibited.', MARGIN, footerY + 30, { width: COL_W });
    doc.restore();

    // ── 5. Serialise ────────────────────────────────────────────────────────
    const pdfBuffer = await streamToBuffer(doc);
    const safeName  = `Transcript_${student.name.replace(/\s+/g, '_')}_${docId}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control':       'no-store',
      },
    });
  } catch (err: any) {
    console.error('[transcript/route] Error:', err);
    return NextResponse.json({ error: 'Failed to generate transcript' }, { status: 500 });
  }
}
