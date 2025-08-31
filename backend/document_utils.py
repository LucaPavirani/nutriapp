from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from io import BytesIO

def set_cell_background(cell, fill):
    """
    Set cell background color
    """
    cell_properties = cell._element.tcPr
    if cell_properties is None:
        cell_properties = OxmlElement('w:tcPr')
        cell._element.append(cell_properties)
    
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), fill)
    cell_properties.append(shading)

def create_diet_document(paziente_data, dieta_data):
    """
    Create a Word document containing the patient's diet plan.
    
    Args:
        paziente_data: Dictionary containing patient data
        dieta_data: Dictionary containing diet data
    
    Returns:
        BytesIO object containing the Word document
    """
    # Create a new document
    doc = Document()
    
    # Add custom styles
    styles = doc.styles
    
    # Style for main food items
    if 'AlimentoPrincipale' not in styles:
        style = styles.add_style('AlimentoPrincipale', WD_STYLE_TYPE.PARAGRAPH)
        font = style.font
        font.bold = True
        font.size = Pt(11)
    
    # Style for equivalent food items
    if 'AlimentoEquivalente' not in styles:
        style = styles.add_style('AlimentoEquivalente', WD_STYLE_TYPE.PARAGRAPH)
        font = style.font
        font.italic = True
        font.size = Pt(10)
    
    # Set document title
    title = doc.add_heading(f'Piano Dietetico', level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add patient information
    doc.add_heading('Informazioni Paziente', level=1)
    patient_info = doc.add_paragraph()
    patient_info.add_run(f"Nome: {paziente_data['nome']} {paziente_data['cognome']}").bold = True
    
    if paziente_data.get('eta'):
        patient_info.add_run(f"\nEtà: {paziente_data['eta']} anni")
    
    if paziente_data.get('email'):
        patient_info.add_run(f"\nEmail: {paziente_data['email']}")
    
    if paziente_data.get('telefono'):
        patient_info.add_run(f"\nTelefono: {paziente_data['telefono']}")
    
    # Add diet notes if available
    if dieta_data.get('note'):
        doc.add_heading('Note', level=1)
        doc.add_paragraph(dieta_data['note'])
    
    # Add meals
    meal_names = {
        'colazione': 'Colazione',
        'spuntino': 'Spuntino',
        'pranzo': 'Pranzo',
        'merenda': 'Merenda',
        'cena': 'Cena'
    }
    
    for meal_key, meal_title in meal_names.items():
        meal_data = dieta_data.get(meal_key)
        if not meal_data:
            continue
            
        doc.add_heading(meal_title, level=1)
        
        # Create table for food items
        if meal_data.get('alimenti') and len(meal_data['alimenti']) > 0:
            # Group alimenti by main and equivalents
            main_alimenti = []
            for alimento in meal_data['alimenti']:
                if alimento.get('tipo') == 'principale':
                    main_alimenti.append(alimento)
            
            table = doc.add_table(rows=1, cols=7)
            table.style = 'Table Grid'
            table.autofit = True
            
            # Set table header
            header_cells = table.rows[0].cells
            header_cells[0].text = 'Alimento'
            header_cells[1].text = 'Quantità'
            header_cells[2].text = 'Kcal'
            header_cells[3].text = 'Proteine (g)'
            header_cells[4].text = 'Lipidi (g)'
            header_cells[5].text = 'Carboidrati (g)'
            header_cells[6].text = 'Fibre (g)'
            
            # Style header
            for cell in header_cells:
                set_cell_background(cell, 'E7E6E6')  # Light gray background
                for paragraph in cell.paragraphs:
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    for run in paragraph.runs:
                        run.bold = True
            
            # Add food items to table
            for alimento in main_alimenti:
                # Add main food item
                row_cells = table.add_row().cells
                
                # Style main food cell
                set_cell_background(row_cells[0], 'F2F2F2')  # Very light gray background
                
                # Add main food name with style
                paragraph = row_cells[0].paragraphs[0]
                run = paragraph.add_run(alimento['nome'])
                run.bold = True
                
                row_cells[1].text = f"{round(alimento['quantita'], 1)} {alimento['unita']}"
                row_cells[2].text = f"{round(alimento['kcal'], 1):.1f}"
                row_cells[3].text = f"{round(alimento['proteine'], 1):.1f}"
                row_cells[4].text = f"{round(alimento['lipidi'], 1):.1f}"
                row_cells[5].text = f"{round(alimento['carboidrati'], 1):.1f}"
                row_cells[6].text = f"{round(alimento['fibre'], 1):.1f}"
                
                # Add equivalents if any
                if alimento.get('equivalenti') and len(alimento['equivalenti']) > 0:
                    # Add a divider row
                    divider_row = table.add_row().cells
                    divider_paragraph = divider_row[0].paragraphs[0]
                    divider_paragraph.add_run("Equivalenti:").italic = True
                    divider_row[0].merge(divider_row[6])  # Merge all cells
                    set_cell_background(divider_row[0], 'F8F8F8')  # Very light gray
                    
                    # Add each equivalent
                    for equiv in alimento['equivalenti']:
                        equiv_row = table.add_row().cells
                        
                        # Mark selected equivalent
                        if equiv.get('selected', False):
                            set_cell_background(equiv_row[0], 'E8F4E8')  # Very light green
                            paragraph = equiv_row[0].paragraphs[0]
                            run = paragraph.add_run(f"{equiv['nome']} ✓")
                            run.italic = True
                        else:
                            paragraph = equiv_row[0].paragraphs[0]
                            run = paragraph.add_run(equiv['nome'])
                            run.italic = True
                        
                        equiv_row[1].text = f"{round(equiv['quantita'], 1)} {equiv['unita']}"
                        equiv_row[2].text = f"{round(equiv['kcal'], 1):.1f}"
                        equiv_row[3].text = f"{round(equiv['proteine'], 1):.1f}"
                        equiv_row[4].text = f"{round(equiv['lipidi'], 1):.1f}"
                        equiv_row[5].text = f"{round(equiv['carboidrati'], 1):.1f}"
                        equiv_row[6].text = f"{round(equiv['fibre'], 1):.1f}"
                    
                    # Add a spacer row after equivalents
                    spacer_row = table.add_row().cells
                    spacer_row[0].merge(spacer_row[6])  # Merge all cells
            
            # Add meal totals
            total_row = table.add_row().cells
            
            # Style the totals row
            for cell in total_row:
                set_cell_background(cell, 'E6E6FA')  # Light lavender background
            
            # Add "TOTALE" text with bold formatting
            paragraph = total_row[0].paragraphs[0]
            run = paragraph.add_run("TOTALE")
            run.bold = True
            
            # Add total values with bold formatting
            total_row[2].text = f"{round(meal_data['totale_kcal'], 1):.1f}"
            total_row[3].text = f"{round(meal_data['totale_proteine'], 1):.1f}"
            total_row[4].text = f"{round(meal_data['totale_lipidi'], 1):.1f}"
            total_row[5].text = f"{round(meal_data['totale_carboidrati'], 1):.1f}"
            total_row[6].text = f"{round(meal_data['totale_fibre'], 1):.1f}"
            
            # Make all totals bold and centered
            for i in range(2, 7):
                paragraph = total_row[i].paragraphs[0]
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.bold = True
        
        else:
            doc.add_paragraph("Nessun alimento presente")
    
    # Add daily totals
    doc.add_heading('Totali Giornalieri', level=1)
    daily_totals = dieta_data.get('totale_giornaliero', {})
    
    if daily_totals:
        # Add a paragraph explaining the totals
        doc.add_paragraph("Riepilogo dei valori nutrizionali giornalieri totali della dieta:")
        
        totals_table = doc.add_table(rows=2, cols=5)
        totals_table.style = 'Table Grid'
        
        # Set table header
        header_cells = totals_table.rows[0].cells
        header_cells[0].text = 'Kcal'
        header_cells[1].text = 'Proteine (g)'
        header_cells[2].text = 'Lipidi (g)'
        header_cells[3].text = 'Carboidrati (g)'
        header_cells[4].text = 'Fibre (g)'
        
        # Style the header cells
        for cell in header_cells:
            set_cell_background(cell, 'D8E4BC')  # Light green background
            for paragraph in cell.paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.bold = True
        
        # Set totals row
        totals_cells = totals_table.rows[1].cells
        
        # Style the totals cells
        for cell in totals_cells:
            set_cell_background(cell, 'EBF1DE')  # Lighter green background
        
        # Add totals with formatting
        for i, (cell, value) in enumerate(zip(
            totals_cells, 
            [
                daily_totals.get('totale_kcal', 0),
                daily_totals.get('totale_proteine', 0),
                daily_totals.get('totale_lipidi', 0),
                daily_totals.get('totale_carboidrati', 0),
                daily_totals.get('totale_fibre', 0)
            ]
        )):
            paragraph = cell.paragraphs[0]
            run = paragraph.add_run(f"{round(value, 1):.1f}")
            run.bold = True
            if i == 0:  # Make calories stand out more
                run.font.size = Pt(12)
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Save document to BytesIO
    doc_stream = BytesIO()
    doc.save(doc_stream)
    doc_stream.seek(0)
    
    return doc_stream
