import io
import re
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_report(analysis: dict, filename: str) -> bytes:
    """
    Compiles a structured AnalysisResult dictionary into a styled PDF report.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    
    # Letter Page size with 0.75in (54pt) margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Sleek branding color system
    primary_color = colors.HexColor("#1e293b")  # Slate 800
    brand_indigo = colors.HexColor("#4f46e5")   # Indigo 600
    slate_body = colors.HexColor("#334155")     # Slate 700
    slate_muted = colors.HexColor("#64748b")    # Slate 500
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=4
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=slate_muted,
        spaceAfter=18
    )
    
    heading_style = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=brand_indigo,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'SecBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=slate_body,
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=5
    )

    story = []
    
    # Utility to translate standard Markdown highlights to clean ReportLab XML-like tags
    def clean_md(text: str) -> str:
        if not text:
            return ""
        # Convert **bold** to <b>bold</b>
        text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)
        # Convert *italic* to <i>italic</i>
        text = re.sub(r"\*(.*?)\*", r"<i>\1</i>", text)
        return text

    # Title Banner and Date
    current_date = datetime.now().strftime("%B %d, %Y")
    story.append(Paragraph("AI Resume Analysis Report", title_style))
    story.append(Paragraph(f"Analyzed File: {filename} &bull; Generated on {current_date}", meta_style))
    
    # Color-coded score brackets
    ats_score = analysis.get("ats_score", 0)
    jd_match_score = analysis.get("jd_match_score")
    
    def get_tier_color(score_val: int) -> colors.HexColor:
        if score_val >= 80:
            return colors.HexColor("#10b981")  # Emerald Green
        if score_val >= 60:
            return colors.HexColor("#f59e0b")  # Amber Yellow
        if score_val >= 40:
            return colors.HexColor("#f97316")  # Orange
        return colors.HexColor("#f43f5e")      # Rose Red

    # Render ATS Score Badge in a styled single-cell table
    ats_color = get_tier_color(ats_score)
    ats_badge_data = [
        [
            Paragraph("<b>AUTOMATED ATS SCORE RATINGS</b>", ParagraphStyle('ATSLbl', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph(f"<b>{ats_score} / 100</b>", ParagraphStyle('ATSVal', parent=body_style, fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=colors.white, alignment=2))
        ]
    ]
    ats_table = Table(ats_badge_data, colWidths=[250, 254])
    ats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ats_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
    ]))
    story.append(ats_table)
    story.append(Spacer(1, 8))
    
    # If Job Description Match present, add a secondary JD Match Badge
    if jd_match_score is not None:
        jd_color = get_tier_color(jd_match_score)
        jd_badge_data = [
            [
                Paragraph("<b>TARGET JOB DESCRIPTION MATCH SCORE</b>", ParagraphStyle('JDLbl', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
                Paragraph(f"<b>{jd_match_score}%</b>", ParagraphStyle('JDVal', parent=body_style, fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=colors.white, alignment=2))
            ]
        ]
        jd_table = Table(jd_badge_data, colWidths=[250, 254])
        jd_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), jd_color),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 14),
            ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ]))
        story.append(jd_table)
        story.append(Spacer(1, 10))

    # 1. Executive Summary
    story.append(Paragraph("Executive Summary", heading_style))
    summary_text = clean_md(analysis.get("summary", "No summary provided."))
    story.append(Paragraph(summary_text, body_style))
    
    # 2. Key Strengths
    story.append(Paragraph("Core Profile Strengths", heading_style))
    for strength in analysis.get("strengths", []):
        text = f'<font color="#10b981"><b>&bull;</b></font> {clean_md(strength)}'
        story.append(Paragraph(text, bullet_style))
        
    # 3. Gaps & Vulnerabilities
    story.append(Paragraph("Identified Gaps & Vulnerabilities", heading_style))
    for weakness in analysis.get("weaknesses", []):
        text = f'<font color="#f97316"><b>&bull;</b></font> {clean_md(weakness)}'
        story.append(Paragraph(text, bullet_style))
        
    # 4. Keywords Found
    story.append(Paragraph("Keywords Detected", heading_style))
    found_keywords = analysis.get("found_keywords", [])
    found_text = ", ".join(found_keywords) if found_keywords else "No major technical keywords detected."
    story.append(Paragraph(clean_md(found_text), body_style))
    
    # 5. Keywords Missing
    story.append(Paragraph("Flagged Missing Keywords", heading_style))
    missing_keywords = analysis.get("missing_keywords", [])
    missing_text = ", ".join(missing_keywords) if missing_keywords else "No vital industry keywords missing."
    story.append(Paragraph(clean_md(missing_text), body_style))
    
    # 6. Actionable Suggestions
    story.append(Paragraph("Actionable ATS Improvement suggestions", heading_style))
    for idx, suggestion in enumerate(analysis.get("suggestions", [])):
        text = f'<b>{idx + 1}.</b> {clean_md(suggestion)}'
        story.append(Paragraph(text, bullet_style))
        
    # Build Document flow
    doc.build(story)
    
    buffer.seek(0)
    return buffer.getvalue()
