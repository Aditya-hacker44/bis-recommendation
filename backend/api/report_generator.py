import os
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, BaseDocTemplate, PageTemplate, Frame
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT, TA_LEFT
from datetime import datetime
import random
import string

# Define Colors
BIS_BLUE = colors.HexColor('#0A2A5E')
LIGHT_BLUE_BG = colors.HexColor('#E8F1F8')
GREEN_OK = colors.HexColor('#22C55E')
LIGHT_GREEN_BG = colors.HexColor('#DCFCE7')
TEXT_DARK = colors.HexColor('#1F2937')
TEXT_MUTED = colors.HexColor('#4B5563')

def generate_government_report(data: dict) -> BytesIO:
    buffer = BytesIO()
    
    # Custom DocTemplate to handle footer
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.8 * inch
    )
    
    styles = getSampleStyleSheet()
    
    # ------------------ STYLES ------------------
    style_header_hi = ParagraphStyle('HeaderHi', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=14, alignment=TA_RIGHT, textColor=BIS_BLUE)
    style_header_en = ParagraphStyle('HeaderEn', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, alignment=TA_RIGHT, textColor=TEXT_DARK)
    style_header_sub = ParagraphStyle('HeaderSub', parent=styles['Normal'], fontName='Helvetica', fontSize=8, alignment=TA_RIGHT, textColor=TEXT_MUTED)
    
    from reportlab.platypus import Image
    style_title_main = ParagraphStyle('TitleMain', parent=styles['Heading1'], fontName='Times-Bold', fontSize=22, alignment=TA_CENTER, textColor=BIS_BLUE, spaceAfter=2)
    style_title_sub = ParagraphStyle('TitleSub', parent=styles['Heading2'], fontName='Times-Bold', fontSize=14, alignment=TA_CENTER, textColor=BIS_BLUE, spaceAfter=15)
    
    style_meta = ParagraphStyle('Meta', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=TEXT_DARK)
    style_meta_right = ParagraphStyle('MetaRight', parent=styles['Normal'], fontName='Helvetica', fontSize=9, alignment=TA_RIGHT, textColor=TEXT_DARK)
    
    style_section_title = ParagraphStyle('SectionTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, textColor=BIS_BLUE, leftIndent=5)
    
    style_body = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=10, textColor=TEXT_DARK, leading=14)
    style_body_bold = ParagraphStyle('BodyBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=TEXT_DARK)
    
    style_table_header = ParagraphStyle('TableHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, alignment=TA_CENTER, textColor=BIS_BLUE)
    style_table_cell = ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Helvetica', fontSize=9, alignment=TA_LEFT, textColor=TEXT_DARK)
    style_table_cell_center = ParagraphStyle('TableCellCenter', parent=styles['Normal'], fontName='Helvetica', fontSize=9, alignment=TA_CENTER, textColor=TEXT_DARK)
    
    elements = []
    
    # Extract data
    now = datetime.now()
    default_id = f"BIS/AI/{now.strftime('%Y')}/" + "".join(random.choices(string.digits, k=4))
    report_id = data.get("id", default_id)
    date_str = data.get("date", now.strftime("%d %B %Y"))
    product_title = data.get("title", "LED street light for road and outdoor lighting")
    standards = data.get("standards", [])
    
    if not standards:
        standards = [
            {"is_number": "IS 10322", "title": "Luminaires for road and street lighting", "match_score": 96},
            {"is_number": "IS 16102 (Part 1)", "title": "LED Luminaires - Part 1: Performance requirements", "match_score": 88}
        ]
        
    # ------------------ TOP HEADER ------------------
    import os
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfbase import pdfmetrics
    
    # Register the Hindi font if it exists
    hindi_font = 'Helvetica' # fallback
    if os.path.exists('assets/NotoSansDevanagari-Regular.ttf'):
        pdfmetrics.registerFont(TTFont('Devanagari', 'assets/NotoSansDevanagari-Regular.ttf'))
        hindi_font = 'Devanagari'

    left_logo = Image('assets/bis_logo.png', width=1.2*inch, height=0.9*inch) if os.path.exists('assets/bis_logo.png') else Paragraph("<b>BIS</b>", ParagraphStyle('', fontName='Helvetica-Bold', fontSize=24, textColor=BIS_BLUE))
    if os.path.exists('assets/emblem.png'):
        right_logo = Table([
            [Image('assets/emblem.png', width=0.7*inch, height=0.7*inch)],
            [Paragraph("<font fontName='{0}'>भारत सरकार</font><br/>Government of India".format(hindi_font), ParagraphStyle('', fontName='Helvetica', fontSize=6, alignment=TA_CENTER, leading=8))]
        ])
        right_logo.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
    else:
        right_logo = Paragraph("<b>GOVERNMENT OF INDIA</b>", ParagraphStyle('', fontName='Helvetica-Bold', fontSize=10, alignment=TA_CENTER))

    header_data = [
        [
            left_logo,
            [
                Paragraph("<b>भारतीय मानक ब्यूरो</b>", ParagraphStyle('', fontName=hindi_font, fontSize=16, alignment=TA_CENTER, textColor=BIS_BLUE, leading=22)),
                Paragraph("उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्रालय", ParagraphStyle('', fontName=hindi_font, fontSize=9, alignment=TA_CENTER, textColor=TEXT_DARK, leading=14)),
                Paragraph("भारत सरकार", ParagraphStyle('', fontName=hindi_font, fontSize=9, alignment=TA_CENTER, textColor=TEXT_DARK, leading=14)),
                Paragraph("BUREAU OF INDIAN STANDARDS", ParagraphStyle('', fontName='Helvetica-Bold', fontSize=12, alignment=TA_CENTER, textColor=TEXT_DARK, leading=16)),
                Paragraph("Ministry of Consumer Affairs, Food & Public Distribution", ParagraphStyle('', fontName='Helvetica', fontSize=8, alignment=TA_CENTER, textColor=TEXT_MUTED, leading=10)),
                Paragraph("Government of India", ParagraphStyle('', fontName='Helvetica', fontSize=8, alignment=TA_CENTER, textColor=TEXT_MUTED, leading=10))
            ],
            right_logo
        ]
    ]
    header_table = Table(header_data, colWidths=[1.3*inch, 4.67*inch, 1.3*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (0,0), 'LEFT'),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('ALIGN', (2,0), (2,0), 'RIGHT'),
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", color=colors.black, thickness=1, spaceBefore=5, spaceAfter=15))
    
    # ------------------ TITLE ------------------
    elements.append(Paragraph("AI STANDARDS ASSISTANT", style_title_main))
    elements.append(Paragraph("<u>BIS Indian Standards Analysis Report</u>", style_title_sub))
    elements.append(Spacer(1, 0.1*inch))
    
    # ------------------ META INFO ------------------
    meta_data = [
        [Paragraph(f"Report No.: {report_id}", style_meta), Paragraph("Page 1 of 1", style_meta_right)],
        [Paragraph(f"Date: {date_str}", style_meta), Paragraph("Generated By: AI Standards Assistant", style_meta_right)]
    ]
    meta_table = Table(meta_data, colWidths=[3.6*inch, 3.6*inch])
    meta_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 2)]))
    elements.append(meta_table)
    elements.append(Spacer(1, 0.1*inch))
    
    # ------------------ SECTION 1 ------------------
    def create_section_header(title):
        t = Table([[Paragraph(title, style_section_title)]], colWidths=[7.2*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), LIGHT_BLUE_BG),
            ('TOPPADDING', (0,0), (0,0), 4),
            ('BOTTOMPADDING', (0,0), (0,0), 4),
            ('LEFTPADDING', (0,0), (0,0), 5),
        ]))
        return t

    elements.append(create_section_header("1. Analysis Completed"))
    
    sec1_data = [
        [
            Paragraph("<font color='white'>✔</font>", ParagraphStyle('', fontName='Helvetica-Bold', fontSize=16, alignment=TA_CENTER)),
            Paragraph(f"Relevant BIS Indian Standards, allied standards, normative references, test methods and applicable requirements identified for the given product description ({product_title}).", style_body)
        ]
    ]
    sec1_table = Table(sec1_data, colWidths=[0.5*inch, 6.7*inch])
    sec1_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (0,0), GREEN_OK),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    
    # Wrap in another table to make the green circle look like a circle or square
    wrapper_sec1 = Table([[
        Table([[Paragraph("<font color='white'>✔</font>", ParagraphStyle('', alignment=TA_CENTER, fontSize=14))]], colWidths=[0.4*inch], rowHeights=[0.4*inch], style=[('BACKGROUND', (0,0), (0,0), GREEN_OK), ('VALIGN', (0,0), (0,0), 'MIDDLE'), ('ALIGN', (0,0), (0,0), 'CENTER')]),
        Paragraph(f"Relevant BIS Indian Standards, allied standards, normative references, test methods and applicable requirements identified for the given product description ({product_title}).", style_body)
    ]], colWidths=[0.6*inch, 6.6*inch])
    wrapper_sec1.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    
    elements.append(Spacer(1, 0.05*inch))
    elements.append(wrapper_sec1)
    elements.append(Spacer(1, 0.2*inch))
    
    # ------------------ SECTION 2 ------------------
    elements.append(create_section_header("2. Primary Recommended BIS Indian Standard(s)"))
    elements.append(Spacer(1, 0.05*inch))
    
    sec2_header = [
        Paragraph("Sr. No.", style_table_header),
        Paragraph("IS Number", style_table_header),
        Paragraph("BIS Standard Title", style_table_header),
        Paragraph("Relevance", style_table_header),
        Paragraph("Latest Version", style_table_header),
        Paragraph("Status", style_table_header),
        Paragraph("Why Recommended", style_table_header)
    ]
    sec2_data = [sec2_header]
    
    for idx, std in enumerate(standards):
        match_score = std.get("match_score", 95)
        # Style relevance block
        rel_block = Table([[Paragraph(f"<b>{match_score}%</b>", style_table_cell_center)]], colWidths=[0.6*inch])
        rel_block.setStyle(TableStyle([('BACKGROUND', (0,0), (0,0), LIGHT_GREEN_BG), ('TOPPADDING', (0,0), (0,0), 3), ('BOTTOMPADDING', (0,0), (0,0), 3)]))
        
        status_block = Paragraph("<font color='green'><b>Active</b></font>", style_table_cell_center)
        
        sec2_data.append([
            Paragraph(str(idx+1), style_table_cell_center),
            Paragraph(f"<b>{std.get('is_number', 'N/A')}</b>", style_table_cell),
            Paragraph(std.get("title", "N/A"), style_table_cell),
            rel_block,
            Paragraph(std.get("is_number", "N/A") + ":2023", style_table_cell),
            status_block,
            Paragraph("Directly applicable for the specified product.", style_table_cell)
        ])
        
    sec2_table = Table(sec2_data, colWidths=[0.5*inch, 1.0*inch, 1.8*inch, 0.7*inch, 1.0*inch, 0.6*inch, 1.6*inch])
    sec2_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), LIGHT_BLUE_BG),
        ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    # Add alternating row colors
    for i in range(1, len(sec2_data)):
        if i % 2 == 0:
            sec2_table.setStyle(TableStyle([('BACKGROUND', (0,i), (-1,i), colors.HexColor('#F9FAFB'))]))
            
    elements.append(sec2_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # ------------------ SECTION 3 ------------------
    elements.append(create_section_header("3. Allied / Related BIS Standards"))
    elements.append(Spacer(1, 0.05*inch))
    
    sec3_data = [
        [
            Paragraph("Sr. No.", style_table_header),
            Paragraph("Category", style_table_header),
            Paragraph("IS Number", style_table_header),
            Paragraph("BIS Standard Title", style_table_header),
            Paragraph("Purpose", style_table_header)
        ],
        [
            Paragraph("1", style_table_cell_center),
            Paragraph("<b>Normative Reference</b>", ParagraphStyle('', parent=style_table_cell, textColor=BIS_BLUE)),
            Paragraph("IS 60598-1", style_table_cell),
            Paragraph("Luminaires - Part 1: General requirements", style_table_cell),
            Paragraph("General safety requirements.", style_table_cell)
        ],
        [
            Paragraph("2", style_table_cell_center),
            Paragraph("<b>Test Method</b>", ParagraphStyle('', parent=style_table_cell, textColor=BIS_BLUE)),
            Paragraph("IS 16106", style_table_cell),
            Paragraph("Methods of test for Luminaires", style_table_cell),
            Paragraph("Testing procedures.", style_table_cell)
        ]
    ]
    sec3_table = Table(sec3_data, colWidths=[0.5*inch, 1.3*inch, 1.0*inch, 2.5*inch, 1.9*inch])
    sec3_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), LIGHT_BLUE_BG),
        ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    for i in range(1, len(sec3_data)):
        if i % 2 == 0:
            sec3_table.setStyle(TableStyle([('BACKGROUND', (0,i), (-1,i), colors.HexColor('#F9FAFB'))]))
            
    elements.append(sec3_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # ------------------ SECTION 4 & 5 ------------------
    # Sec 4
    sec4_content = [
        [Paragraph("4. Version & Amendment Information", style_section_title)],
        [Table([
            [Paragraph("✔", ParagraphStyle('', textColor=GREEN_OK, fontSize=12)), Paragraph("<b>Latest Version:</b> IS 10322:2023", style_body)],
            [Paragraph("i", ParagraphStyle('', textColor=BIS_BLUE, fontSize=12)), Paragraph("<b>Previous Version:</b> IS 10322:2012 (Revised)", style_body)],
            [Paragraph("i", ParagraphStyle('', textColor=BIS_BLUE, fontSize=12)), Paragraph("<b>Latest Amendment:</b> Amendment 1: 2024", style_body)],
            [Paragraph("✔", ParagraphStyle('', textColor=GREEN_OK, fontSize=12)), Paragraph("<b>Status:</b> Active", style_body)]
        ], colWidths=[0.2*inch, 3.2*inch], style=[('VALIGN', (0,0), (-1,-1), 'TOP')])]
    ]
    sec4_table = Table(sec4_content, colWidths=[3.5*inch])
    sec4_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#FEF9C3')), # Yellowish header
        ('BOX', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    # Sec 5
    sec5_content = [
        [Paragraph("5. BIS Certification Requirements", ParagraphStyle('', parent=style_section_title, textColor=colors.HexColor('#4338CA')))],
        [Table([
            [Paragraph("<b>Requirement</b>", style_table_cell), Paragraph("<b>Status</b>", style_table_cell)],
            [Paragraph("BIS Product Certification", style_table_cell), Paragraph("<font color='red'>Applicable (as per QCO)</font>", ParagraphStyle('', parent=style_table_cell, backColor=colors.HexColor('#FEE2E2')))],
            [Paragraph("CRS (Compulsory Reg.)", style_table_cell), Paragraph("Not Applicable", ParagraphStyle('', parent=style_table_cell, backColor=colors.HexColor('#F3F4F6')))],
            [Paragraph("Hallmarking", style_table_cell), Paragraph("Not Applicable", ParagraphStyle('', parent=style_table_cell, backColor=colors.HexColor('#F3F4F6')))],
        ], colWidths=[1.8*inch, 1.6*inch], style=[('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey), ('VALIGN', (0,0), (-1,-1), 'MIDDLE')])]
    ]
    sec5_table = Table(sec5_content, colWidths=[3.5*inch])
    sec5_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#E0E7FF')), # Purplish header
        ('BOX', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    bottom_layout = Table([[sec4_table, sec5_table]], colWidths=[3.6*inch, 3.6*inch])
    bottom_layout.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
    elements.append(bottom_layout)
    
    # ------------------ FOOTER ------------------
    def add_footer_and_watermark(canvas, doc):
        canvas.saveState()
        
        # Watermark
        canvas.setFont('Helvetica-Bold', 50)
        canvas.setFillGray(0.95)
        canvas.translate(A4[0]/2, A4[1]/2)
        canvas.rotate(45)
        canvas.drawCentredString(0, 0, "BUREAU OF INDIAN STANDARDS")
        canvas.restoreState()
        
        canvas.saveState()
        # Footer Bar
        canvas.setFillColor(BIS_BLUE)
        canvas.rect(0, 0, A4[0], 0.6*inch, fill=1, stroke=0)
        
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica', 8)
        canvas.drawString(0.5*inch, 0.4*inch, "Manak Bhavan, 9, Bahadur Shah Zafar Marg, New Delhi - 110002")
        canvas.drawString(0.5*inch, 0.25*inch, "Tel.: 23230131, 23233375, 23239402")
        canvas.drawString(0.5*inch, 0.1*inch, "e-mail : info@bis.gov.in   Website : www.bis.gov.in")
        
        # Officer Name in Bottom Right Corner (Above footer)
        canvas.setFillColor(TEXT_DARK)
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawRightString(A4[0] - 0.5*inch, 0.8*inch, "Officer Name: Aditya (Procurement)")
        canvas.restoreState()

    doc.build(elements, onFirstPage=add_footer_and_watermark, onLaterPages=add_footer_and_watermark)
    buffer.seek(0)
    return buffer
