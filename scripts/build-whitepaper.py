from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "WHITEPAPER.md"
OUTPUT = ROOT / "output" / "pdf" / "house-of-joshi-swap-whitepaper.pdf"
LOGO = Path("/Users/anshujoshi/Downloads/HOJ Logo.PNG")

GOLD = colors.HexColor("#D6A928")
PALE_GOLD = colors.HexColor("#F5E8B4")
INK = colors.HexColor("#17130B")
MUTED = colors.HexColor("#6E6658")
PAPER = colors.HexColor("#FCFAF5")
LINE = colors.HexColor("#D9CFB8")


class NumberedDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
            id="body",
        )
        self.addPageTemplates(PageTemplate(id="main", frames=[frame], onPage=self.decorate))

    def decorate(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        if doc.page > 1:
            canvas.setStrokeColor(LINE)
            canvas.setLineWidth(0.5)
            canvas.line(22 * mm, A4[1] - 18 * mm, A4[0] - 22 * mm, A4[1] - 18 * mm)
            canvas.setFont("Helvetica-Bold", 8)
            canvas.setFillColor(MUTED)
            canvas.drawString(22 * mm, A4[1] - 14 * mm, "HOUSE OF JOSHI SWAP")
            canvas.setFont("Helvetica", 8)
            canvas.drawRightString(A4[0] - 22 * mm, A4[1] - 14 * mm, "TECHNICAL WHITEPAPER")
            canvas.line(22 * mm, 16 * mm, A4[0] - 22 * mm, 16 * mm)
            canvas.drawString(22 * mm, 11 * mm, "Version 1.0 - August 2026")
            canvas.drawRightString(A4[0] - 22 * mm, 11 * mm, str(doc.page))
        canvas.restoreState()


styles = getSampleStyleSheet()
body = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9.25,
    leading=14.2,
    textColor=INK,
    spaceAfter=7,
)
h1 = ParagraphStyle(
    "H1",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=19,
    leading=23,
    textColor=INK,
    spaceBefore=9,
    spaceAfter=9,
    keepWithNext=True,
)
h2 = ParagraphStyle(
    "H2",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=12,
    leading=15,
    textColor=colors.HexColor("#7A5A00"),
    spaceBefore=8,
    spaceAfter=5,
    keepWithNext=True,
)
bullet = ParagraphStyle(
    "Bullet",
    parent=body,
    leftIndent=14,
    firstLineIndent=-8,
    bulletIndent=4,
    spaceAfter=3,
)
small = ParagraphStyle("Small", parent=body, fontSize=8, leading=11, textColor=MUTED)
cover_title = ParagraphStyle(
    "CoverTitle",
    parent=h1,
    fontSize=32,
    leading=36,
    alignment=TA_CENTER,
    textColor=INK,
)
cover_subtitle = ParagraphStyle(
    "CoverSubtitle",
    parent=body,
    fontName="Helvetica-Bold",
    fontSize=13,
    leading=17,
    alignment=TA_CENTER,
    textColor=colors.HexColor("#8B6500"),
)
cover_meta = ParagraphStyle(
    "CoverMeta", parent=small, fontSize=9, leading=14, alignment=TA_CENTER
)


def inline(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"`([^`]+)`", r'<font name="Courier">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    urls = re.compile(r"(?<![\"=])(https://[^\s<]+)")
    text = urls.sub(lambda m: f'<link href="{m.group(1)}" color="#7A5A00">{m.group(1)}</link>', text)
    return text


def parse_table(lines):
    rows = []
    for line in lines:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if all(re.fullmatch(r"[-: ]+", c or "-") for c in cells):
            continue
        rows.append([Paragraph(inline(c), small) for c in cells])
    column_count = max(len(row) for row in rows)
    if column_count == 2:
        widths = [43 * mm, 112 * mm]
    elif column_count == 4:
        widths = [43 * mm, 24 * mm, 27 * mm, 61 * mm]
    else:
        widths = [155 * mm / column_count] * column_count
    table = Table(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def build_story(markdown):
    lines = markdown.splitlines()
    story = []
    if LOGO.exists():
        logo = Image(str(LOGO), width=55 * mm, height=55 * mm)
        logo.hAlign = "CENTER"
        story.extend([Spacer(1, 22 * mm), logo, Spacer(1, 12 * mm)])
    else:
        story.append(Spacer(1, 42 * mm))
    story.extend(
        [
            Paragraph("HOUSE OF JOSHI SWAP", cover_title),
            Spacer(1, 5 * mm),
            Paragraph("TECHNICAL WHITEPAPER", cover_subtitle),
            Spacer(1, 13 * mm),
            Paragraph("Version 1.0 - August 2026", cover_meta),
            Spacer(1, 5 * mm),
            Paragraph("swap.thehouseofjoshi.com", cover_meta),
            Spacer(1, 26 * mm),
            Table([[""]], colWidths=[55 * mm], rowHeights=[1.8 * mm], style=[("BACKGROUND", (0, 0), (-1, -1), GOLD)]),
            PageBreak(),
        ]
    )

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or line in {"# House of Joshi Swap", "## Technical Whitepaper"} or line.startswith("Version 1.0") or line.startswith("Website:") or line.startswith("Repository:") or line.startswith("X:"):
            i += 1
            continue
        if line.startswith("| "):
            block = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                block.append(lines[i].strip())
                i += 1
            story.extend([Spacer(1, 2 * mm), KeepTogether([parse_table(block)]), Spacer(1, 4 * mm)])
            continue
        if line.startswith("## "):
            title = line[3:]
            if title == "4. BNB Chain deployment":
                story.append(PageBreak())
            story.append(Paragraph(inline(title), h1))
        elif line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), h2))
        elif re.match(r"^\d+\. ", line):
            story.append(Paragraph(inline(line), bullet, bulletText=""))
        elif line.startswith("- "):
            story.append(Paragraph(inline(line[2:]), bullet, bulletText="•"))
        else:
            story.append(Paragraph(inline(line), body))
        i += 1
    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = NumberedDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=22 * mm,
        rightMargin=22 * mm,
        topMargin=24 * mm,
        bottomMargin=21 * mm,
        title="House of Joshi Swap Technical Whitepaper",
        author="The House of Joshi",
        subject="Technical architecture, BNB Chain deployment, native XRP Ledger integration, fees, and security",
    )
    doc.build(build_story(SOURCE.read_text(encoding="utf-8")))
    print(OUTPUT)


if __name__ == "__main__":
    main()
