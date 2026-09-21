import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CategoryMesure } from '../../categorie/models/categorie.enum';
import { ModePaiement } from '../../shared/model/util.enum';
import { EnumMethodes } from '../../shared/utils/util-methode';
import { LigneVenteHistorique, VenteHistoriqueDetailDto } from '../models/vente.dto';

@Injectable({ providedIn: 'root' })
export class GenerateFacturePdfUtil {
  private readonly company = {
    name: 'SONGHOÏ COLLECTION',
    activity: 'Pour hommes et femmes',
    address: 'Fasso Kanu, à 100 m de la station SMC',
    phones: '82 82 90 07 / 93 42 13 44 / 83 64 22 13',
  };

  generate(vente: VenteHistoriqueDetailDto): void {
    const document = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight = document.internal.pageSize.getHeight();
    const margin = 16;
    const total = Math.round(vente.totalVente ?? 0);
    const montantPaye = Math.round(vente.montantPaye ?? 0);
    const resteAPayer = Math.round(vente.resteAPayer ?? 0);

    this.drawHeader(document, vente, pageWidth, margin);
    this.drawLines(document, vente.lignes, margin);

    const tableFinalY = (document as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 64;
    const summaryY = this.ensureSpace(document, tableFinalY + 10, 62, pageHeight, margin);
    this.drawSummary(document, total, montantPaye, resteAPayer, pageWidth, margin, summaryY);
    this.drawSignatures(document, pageWidth, margin, summaryY + 35);
    this.drawPageNumbers(document, pageWidth, pageHeight);
    this.save(document, vente.numeroFacture);
  }

  private drawHeader(document: jsPDF, vente: VenteHistoriqueDetailDto, pageWidth: number, margin: number): void {
    document.setTextColor(48, 37, 29);
    document.setFont('times', 'bold');
    document.setFontSize(19);
    document.text(this.company.name, margin, 19);

    document.setFont('helvetica', 'normal');
    document.setFontSize(8);
    document.setTextColor(105, 90, 74);
    document.text(this.company.activity, margin, 24.5);
    document.text(this.company.address, margin, 29);
    document.text(`Tél. : ${this.company.phones}`, margin, 33.5);

    const invoiceLeft = pageWidth - margin - 49;
    document.setFillColor(66, 51, 38);
    document.roundedRect(invoiceLeft, 13, 49, 22, 1.5, 1.5, 'F');
    document.setTextColor(255, 255, 255);
    document.setFont('helvetica', 'bold');
    document.setFontSize(13.5);
    document.text('FACTURE', invoiceLeft + 5, 21);
    document.setFont('helvetica', 'normal');
    document.setFontSize(8);
    document.text(vente.numeroFacture?.trim() || `Vente ${vente.id}`, invoiceLeft + 5, 28);

    document.setDrawColor(193, 154, 83);
    document.setLineWidth(.5);
    document.line(margin, 41, pageWidth - margin, 41);

    const clientWidth = 102;
    document.setFillColor(249, 246, 241);
    document.roundedRect(margin, 47, clientWidth, 12, 1.5, 1.5, 'F');
    document.setTextColor(132, 116, 98);
    document.setFont('helvetica', 'bold');
    document.setFontSize(7);
    document.text('CLIENT', margin + 4, 51.5);
    document.setTextColor(48, 37, 29);
    document.setFontSize(9);
    document.text(vente.client?.trim() || 'Client de passage', margin + 4, 56.5);

    const paymentLeft = margin + clientWidth + 6;
    document.setDrawColor(229, 220, 210);
    document.setLineWidth(.25);
    document.roundedRect(paymentLeft, 47, pageWidth - margin - paymentLeft, 12, 1.5, 1.5, 'S');
    document.setTextColor(132, 116, 98);
    document.setFontSize(7);
    document.text('MODE DE PAIEMENT', paymentLeft + 4, 51.5);
    document.setTextColor(48, 37, 29);
    document.setFont('helvetica', 'bold');
    document.setFontSize(8.5);
    document.text(this.paymentLabel(vente.modePaiement), paymentLeft + 4, 56.5);
  }

  private drawLines(document: jsPDF, lines: LigneVenteHistorique[], margin: number): void {
    autoTable(document, {
      startY: 64,
      margin: { left: margin, right: margin },
      head: [['DESIGNATION', 'QTE', 'P.U. (FCFA)', 'MONTANT (FCFA)']],
      body: lines.map(line => [
        line.referenceVariant || 'Référence non renseignée',
        this.formatQuantity(line),
        this.formatAmount(line.prixVente),
        this.formatAmount(line.totalLigne),
      ]),
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: { top: 2, right: 2.5, bottom: 2, left: 2.5 },
        textColor: [48, 37, 29],
        valign: 'middle',
        lineColor: [35, 35, 35],
        lineWidth: .2,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [25, 25, 25],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: { top: 2.2, right: 2.5, bottom: 2.2, left: 2.5 },
      },
      columnStyles: {
        0: { cellWidth: 84 },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 33, halign: 'right' },
        3: { cellWidth: 39, halign: 'right' },
      },
      tableLineColor: [25, 25, 25],
      tableLineWidth: .2,
    });
  }

  private drawSummary(
    document: jsPDF,
    total: number,
    montantPaye: number,
    resteAPayer: number,
    pageWidth: number,
    margin: number,
    y: number,
  ): void {
    const blockWidth = 70;
    const left = pageWidth - margin - blockWidth;
    const noteWidth = left - margin - 12;

    document.setFont('helvetica', 'bold');
    document.setFontSize(8);
    document.setTextColor(66, 51, 38);
    document.text('ARRÊTÉE LA PRÉSENTE FACTURE À LA SOMME DE :', margin, y + 5);
    document.setFont('helvetica', 'normal');
    document.setFontSize(8.5);
    document.setTextColor(85, 72, 61);
    const amountInWords = `${this.capitalize(this.amountInWords(total))} francs CFA.`;
    document.text(document.splitTextToSize(amountInWords, noteWidth), margin, y + 11);

    this.drawTotalRow(document, 'TOTAL FACTURE', total, left, y, blockWidth, false);
    this.drawTotalRow(document, 'MONTANT RÉGLÉ', montantPaye, left, y + 7, blockWidth, false);
    this.drawTotalRow(document, 'RESTE À PAYER', resteAPayer, left, y + 14, blockWidth, true);

  }

  private drawTotalRow(
    document: jsPDF,
    label: string,
    amount: number,
    left: number,
    y: number,
    width: number,
    highlight: boolean,
  ): void {
    if (highlight) {
      document.setFillColor(amount > 0 ? 139 : 58, amount > 0 ? 79 : 94, amount > 0 ? 46 : 62);
      document.roundedRect(left, y, width, 7, 1, 1, 'F');
      document.setTextColor(255, 255, 255);
    } else {
      document.setDrawColor(230, 222, 213);
      document.setLineWidth(.16);
      document.line(left, y + 6.7, left + width, y + 6.7);
      document.setTextColor(105, 90, 74);
    }

    document.setFont('helvetica', highlight ? 'bold' : 'normal');
    document.setFontSize(highlight ? 8.5 : 7.5);
    document.text(label, left + 3, y + 4.5);
    document.setFont('helvetica', 'bold');
    document.setFontSize(highlight ? 9.5 : 8.5);
    document.text(`${this.formatAmount(amount)} FCFA`, left + width - 3, y + 4.5, { align: 'right' });
  }

  private drawSignatures(document: jsPDF, pageWidth: number, margin: number, y: number): void {
    document.setDrawColor(220, 207, 190);
    document.setLineWidth(.2);
    document.line(margin, y - 6, pageWidth - margin, y - 6);

    document.setFont('helvetica', 'normal');
    document.setFontSize(8);
    document.setTextColor(105, 90, 74);
    document.text(`Bamako, le ${this.today()}`, pageWidth - margin, y, { align: 'right' });

    document.setTextColor(48, 37, 29);
    document.setFont('helvetica', 'bold');
    document.setFontSize(8.5);
    document.text('Pour acquit', margin + 23, y + 10, { align: 'center' });
    document.text('Le fournisseur', pageWidth - margin - 23, y + 10, { align: 'center' });

    document.setDrawColor(154, 142, 130);
    document.setLineWidth(.15);
    document.line(margin + 3, y + 27, margin + 43, y + 27);
    document.line(pageWidth - margin - 43, y + 27, pageWidth - margin - 3, y + 27);
  }

  private ensureSpace(document: jsPDF, y: number, requiredHeight: number, pageHeight: number, margin: number): number {
    if (y + requiredHeight <= pageHeight - margin) return y;
    document.addPage();
    return margin + 12;
  }

  private drawPageNumbers(document: jsPDF, pageWidth: number, pageHeight: number): void {
    const pageCount = document.getNumberOfPages();
    if (pageCount < 2) return;

    for (let page = 1; page <= pageCount; page++) {
      document.setPage(page);
      document.setFont('helvetica', 'normal');
      document.setFontSize(7);
      document.setTextColor(143, 131, 120);
      document.text(`Page ${page} / ${pageCount}`, pageWidth - 16, pageHeight - 8, { align: 'right' });
    }
  }

  private formatQuantity(line: LigneVenteHistorique): string {
    const unit = EnumMethodes.getEnumValueByKey(CategoryMesure, line.unite) ?? line.unite;
    const quantity = Number(line.quantite ?? 0);
    const formatted = Number.isInteger(quantity)
      ? String(quantity)
      : quantity.toFixed(3).replace(/\.?0+$/, '').replace('.', ',');
    return `${formatted} ${this.quantityUnit(unit, quantity)}`;
  }

  private paymentLabel(mode: ModePaiement | null | undefined): string {
    if (!mode) return 'Non renseigné';
    return EnumMethodes.getEnumValueByKey(ModePaiement, mode) ?? String(mode);
  }

  private formatAmount(value: number): string {
    return Math.round(value ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  private today(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }

  private quantityUnit(unit: string, quantity: number): string {
    if (Math.abs(quantity) === 1) return unit;
    if (unit.toLocaleLowerCase('fr-FR') === 'mètre') return 'Mètres';
    if (unit.toLocaleLowerCase('fr-FR') === 'unité') return 'Unités';
    if (unit.toLocaleLowerCase('fr-FR') === 'pagne') return 'Pagnes';
    if (unit.toLocaleLowerCase('fr-FR') === 'carton') return 'Cartons';
    return unit.endsWith('s') ? unit : `${unit}s`;
  }

  private save(document: jsPDF, numeroFacture: string | null): void {
    const reference = (numeroFacture || 'facture-songhoi-couture')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/^-|-$/g, '');
    document.save(`${reference || 'facture-songhoi-couture'}.pdf`);
  }

  private amountInWords(value: number, currency: string = 'francs'): string {
    const amount = Math.max(0, Math.round(value));
    if (amount === 0) return `zéro ${currency}`;

    const groups: Array<{ value: number; singular: string; plural: string }> = [
      { value: 1_000_000_000, singular: 'milliard', plural: 'milliards' },
      { value: 1_000_000, singular: 'million', plural: 'millions' },
      { value: 1_000, singular: 'mille', plural: 'mille' },
    ];
    
    const words: string[] = [];
    let remaining = amount;

    for (const group of groups) {
      const count = Math.floor(remaining / group.value);
      if (!count) continue;
      
      remaining %= group.value;
      
      if (group.value === 1_000) {
        // "mille" ne prend jamais de S et on ne dit pas "un mille"
        words.push(count === 1 ? group.singular : `${this.lessThanThousand(count, true)} ${group.singular}`);
      } else {
        const groupWord = count === 1 ? group.singular : group.plural;
        words.push(`${this.lessThanThousand(count, false)} ${groupWord}`);
      }
    }
    
    if (remaining) {
      words.push(this.lessThanThousand(remaining, false));
    }

    const finalString = words.join(' ');
    
    // Règle syntaxique : "un million DE francs", "deux milliards DE francs"
    const standardEnding = ['million', 'millions', 'milliard', 'milliards'];
    const needsDe = standardEnding.some(ending => finalString.endsWith(ending));
    
    return needsDe ? `${finalString} de ${currency}` : `${finalString} ${currency}`;
}

private lessThanThousand(value: number, isFollowedByMille: boolean): string {
    const hundreds = Math.floor(value / 100);
    const remaining = value % 100;
    const words: string[] = [];

    if (hundreds) {
      if (hundreds === 1) {
        words.push('cent');
      } else {
        // "cent" prend un "s" uniquement s'il est multiplié ET directement final
        const hasS = remaining === 0 && !isFollowedByMille;
        words.push(`${this.lessThanHundred(hundreds, false)} cent${hasS ? 's' : ''}`);
      }
    }
    
    if (remaining) {
      words.push(this.lessThanHundred(remaining, isFollowedByMille));
    }
    
    return words.join(' ');
}

private lessThanHundred(value: number, isFollowed: boolean): string {
    const units = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
    
    if (value <= 16) return units[value];
    if (value < 20) return `dix-${units[value - 10]}`;
    
    if (value < 70) {
      const ten = Math.floor(value / 10);
      const unit = value % 10;
      return unit === 0 ? tens[ten] : unit === 1 ? `${tens[ten]} et un` : `${tens[ten]}-${units[unit]}`;
    }
    
    if (value < 80) {
      return value === 71 ? 'soixante et onze' : `soixante-${this.lessThanHundred(value - 60, isFollowed)}`;
    }
    
    if (value === 80) {
      // "vingt" prend un "s" à 80 tout rond, SOUF s'il y a un mot comme "mille" derrière
      return isFollowed ? 'quatre-vingt' : 'quatre-vingts';
    }
    
    return `quatre-vingt-${this.lessThanHundred(value - 80, isFollowed)}`;
}


  private capitalize(value: string): string {
    return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
  }
}
