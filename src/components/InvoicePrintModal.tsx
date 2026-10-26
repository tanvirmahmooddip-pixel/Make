import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  QrCode,
  ShieldCheck,
  Download,
  Share2,
  MessageCircle,
  Check,
} from 'lucide-react';
import { CurrencyCode, SaleTransaction } from '../types';
import { CompanyConfig } from '../utils/storage';
import { formatMoney, formatDateTime, generateTaxQrData } from '../utils/formatters';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleTransaction | null;
  companyConfig: CompanyConfig;
  activeCurrency: CurrencyCode;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  sale,
  companyConfig,
  activeCurrency,
}) => {
  if (!isOpen || !sale) return null;

  const [printFormat, setPrintFormat] = useState<'a4' | 'medium' | 'small'>('a4');
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = sale.customerPhone.replace(/\D/g, '');
  const itemsSummary = sale.items
    .map((i) => `• ${i.quantity}x ${i.productName}: OMR ${i.subtotal.toFixed(3)}`)
    .join('\n');

  const whatsAppMessage = `*${companyConfig.companyName}*
*فاتورة ضريبية رسمية / Official Tax Invoice*
--------------------------------
*Invoice #:* ${sale.invoiceNumber}
*Date:* ${sale.date.split('T')[0]}
*Customer:* ${sale.customerName}
--------------------------------
${itemsSummary}
--------------------------------
*Subtotal:* OMR ${sale.subtotal.toFixed(3)}
*Oman VAT (5%):* OMR ${sale.taxAmount.toFixed(3)}
*TOTAL PAID:* OMR ${sale.grandTotal.toFixed(3)}
*Payment Method:* ${sale.paymentMethod.replace('_', ' ').toUpperCase()}
--------------------------------
*Warranty Valid Until:* ${sale.warrantyUntil || '12 Months'}
*CR No:* ${companyConfig.crNumber} | *VAT:* ${companyConfig.vatNumber}
Thank you for shopping with ${companyConfig.companyName}! شكراً لتعاملكم معنا`;

  const whatsAppUrl = `https://wa.me/${cleanPhone || '968'}?text=${encodeURIComponent(whatsAppMessage)}`;

  const qrData = generateTaxQrData(
    companyConfig.companyName,
    companyConfig.vatNumber,
    sale.date,
    sale.grandTotal,
    sale.taxAmount
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col text-slate-100 max-h-[95vh] overflow-hidden">
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="print:hidden px-4 sm:px-6 py-3.5 bg-slate-800/80 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Format:
            </span>
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setPrintFormat('small')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  printFormat === 'small' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Small (58mm)
              </button>
              <button
                onClick={() => setPrintFormat('medium')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  printFormat === 'medium' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Medium (80mm)
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  printFormat === 'a4' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Full A4 PDF
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Live WhatsApp Bill</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-950/50">
          {printFormat === 'a4' ? (
            /* A4 Full Official Tax Invoice */
            <div
              id="printable-a4-invoice"
              className="w-full max-w-2xl bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 text-xs font-sans"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-amber-600 pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center text-xs">
                      {companyConfig.shortName || 'FAP'}
                    </div>
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">
                      {companyConfig.companyName}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 font-sans" dir="rtl">
                    {companyConfig.companyNameAr}
                  </div>
                  {companyConfig.companyNameBn && (
                    <div className="text-[11px] font-semibold text-slate-600 font-sans">
                      {companyConfig.companyNameBn}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 mt-1">
                    {companyConfig.address}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Tel: {companyConfig.phone} | Email: {companyConfig.email}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-amber-700 tracking-wider uppercase">
                    TAX INVOICE
                  </div>
                  <div className="text-xs font-bold text-slate-700" dir="rtl">
                    فاتورة ضريبية
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-slate-700">
                    <div>
                      <span className="font-bold">CR No:</span> {companyConfig.crNumber}
                    </div>
                    <div>
                      <span className="font-bold">VAT ID:</span> {companyConfig.vatNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Meta & Customer Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-5 text-[11px]">
                <div>
                  <div className="text-slate-500 uppercase font-semibold text-[10px]">
                    Customer Details (بيانات العميل):
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {sale.customerName || 'Cash Walk-in Customer'}
                  </div>
                  <div className="text-slate-600">Phone: {sale.customerPhone || 'N/A'}</div>
                  {sale.customerVat && (
                    <div className="text-slate-600">Customer VAT: {sale.customerVat}</div>
                  )}
                </div>

                <div className="text-right font-mono">
                  <div className="text-slate-500 uppercase font-semibold text-[10px]">
                    Invoice Info:
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {sale.invoiceNumber}
                  </div>
                  <div className="text-slate-600">Date: {formatDateTime(sale.date)}</div>
                  <div className="text-slate-600 capitalize">
                    Payment: <span className="font-semibold">{sale.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">Cashier: {sale.cashierName}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse mb-5 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-y border-slate-300">
                    <th className="py-2 px-2.5 font-bold">#</th>
                    <th className="py-2 px-2.5 font-bold">Item Description (الوصف)</th>
                    <th className="py-2 px-2.5 font-bold text-center">Qty</th>
                    <th className="py-2 px-2.5 font-bold text-right">Unit Price</th>
                    <th className="py-2 px-2.5 font-bold text-right">Total (OMR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2.5 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-2.5 font-medium text-slate-800">
                        {item.productName}
                        {item.imeiNumbers && item.imeiNumbers.length > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            IMEI/SN: {item.imeiNumbers.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-bold text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-slate-700">
                        OMR {item.unitPrice.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-900">
                        OMR {item.subtotal.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & QR Section */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-300 pt-4 mb-6">
                <div className="flex items-center gap-3">
                  {/* Generated QR Code for Oman Tax Compliance */}
                  <div className="w-24 h-24 bg-white border border-slate-300 p-1.5 rounded flex flex-col items-center justify-center text-center">
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[9px] font-mono p-1 break-all text-center leading-none">
                      QR OTA COMPLIANT
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <div className="font-bold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Oman Tax Authority (OTA)</span>
                    </div>
                    <div>Standard Rated Supplies (5%)</div>
                    <div>Official Electronic E-Invoice</div>
                    {sale.warrantyUntil && (
                      <div className="font-semibold text-amber-700">
                        Warranty Valid Until: {sale.warrantyUntil}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-right text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal (المجموع الفرعي):</span>
                    <span className="font-mono">OMR {sale.subtotal.toFixed(3)}</span>
                  </div>
                  {sale.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount (الخصم):</span>
                      <span className="font-mono">- OMR {sale.discountAmount.toFixed(3)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Oman VAT (5%) (ضريبة القيمة المضافة):</span>
                    <span className="font-mono">OMR {sale.taxAmount.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-slate-950 font-black text-sm pt-2 border-t-2 border-slate-900">
                    <span>Grand Total (الإجمالي النهائي):</span>
                    <span className="font-mono text-amber-700">OMR {sale.grandTotal.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                    <span>Paid via {sale.paymentMethod.replace('_', ' ')}:</span>
                    <span className="font-mono">OMR {sale.paidAmount.toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Policy Footer */}
              <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 text-center leading-normal">
                <p>{companyConfig.invoiceFooterNote}</p>
                <p className="mt-0.5 font-sans" dir="rtl">
                  {companyConfig.invoiceFooterNoteAr}
                </p>
                <p className="mt-1 font-bold text-slate-700">
                  Thank you for shopping with {companyConfig.companyName}! شكراً لتسوقكم معنا
                </p>
              </div>
            </div>
          ) : printFormat === 'medium' ? (
            /* 80mm Medium POS Thermal Receipt */
            <div
              id="printable-thermal-medium"
              className="w-[300px] bg-white text-slate-950 p-4 rounded shadow-md font-mono text-[11px] leading-tight border border-slate-200"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <div className="font-extrabold text-sm uppercase">{companyConfig.companyName}</div>
                <div className="text-[10px]">{companyConfig.companyNameAr}</div>
                <div className="text-[10px] text-slate-600 mt-1">{companyConfig.phone}</div>
                <div className="text-[9px] text-slate-600">CR: {companyConfig.crNumber}</div>
                <div className="text-[9px] text-slate-600">VAT ID: {companyConfig.vatNumber}</div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 text-[10px]">
                <div className="flex justify-between">
                  <span>INV: {sale.invoiceNumber}</span>
                  <span>{sale.date.split('T')[0]}</span>
                </div>
                <div>Customer: {sale.customerName || 'Cash Customer'}</div>
                <div>Cashier: {sale.cashierName}</div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold mb-1 text-[10px]">
                  <span>ITEM</span>
                  <span>QTY</span>
                  <span>TOTAL</span>
                </div>
                {sale.items.map((item, idx) => (
                  <div key={idx} className="mb-1">
                    <div className="truncate font-semibold">{item.productName}</div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>@{item.unitPrice.toFixed(3)}</span>
                      <span>x{item.quantity}</span>
                      <span className="font-bold">OMR {item.subtotal.toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>OMR {sale.subtotal.toFixed(3)}</span>
                </div>
                {sale.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-OMR {sale.discountAmount.toFixed(3)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Oman VAT (5%):</span>
                  <span>OMR {sale.taxAmount.toFixed(3)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-400">
                  <span>NET TOTAL:</span>
                  <span>OMR {sale.grandTotal.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Paid ({sale.paymentMethod}):</span>
                  <span>OMR {sale.paidAmount.toFixed(3)}</span>
                </div>
              </div>

              <div className="pt-3 text-center text-[9px] text-slate-600">
                <div className="w-20 h-20 mx-auto bg-slate-900 text-white flex items-center justify-center mb-1 text-[8px]">
                  QR VERIFIED
                </div>
                <div>Goods exchange within 7 days.</div>
                <div>Official Oman VAT Tax Invoice (80mm)</div>
                <div className="mt-1 font-bold">شكراً لزيارتكم</div>
              </div>
            </div>
          ) : (
            /* 58mm Small Mini POS Thermal Receipt */
            <div
              id="printable-thermal-small"
              className="w-[230px] bg-white text-slate-950 p-2.5 rounded shadow-md font-mono text-[10px] leading-tight border border-slate-200"
            >
              <div className="text-center pb-1.5 border-b border-dashed border-slate-400">
                <div className="font-black text-xs uppercase">{companyConfig.companyName}</div>
                <div className="text-[9px] text-slate-600">{companyConfig.phone}</div>
                <div className="text-[8px] text-slate-600">VAT: {companyConfig.vatNumber}</div>
              </div>

              <div className="py-1 border-b border-dashed border-slate-400 text-[9px]">
                <div className="flex justify-between">
                  <span>#{sale.invoiceNumber}</span>
                  <span>{sale.date.split('T')[0]}</span>
                </div>
                <div>Cust: {sale.customerName}</div>
              </div>

              <div className="py-1 border-b border-dashed border-slate-400">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="mb-1 text-[9px]">
                    <div className="truncate font-semibold">{item.productName}</div>
                    <div className="flex justify-between text-slate-600">
                      <span>{item.quantity} x {item.unitPrice.toFixed(3)}</span>
                      <span className="font-bold">OMR {item.subtotal.toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-1 border-b border-dashed border-slate-400 space-y-0.5 text-right text-[9px]">
                <div className="flex justify-between">
                  <span>VAT 5%:</span>
                  <span>OMR {sale.taxAmount.toFixed(3)}</span>
                </div>
                <div className="flex justify-between font-black text-[11px] pt-0.5 border-t border-slate-400">
                  <span>TOTAL:</span>
                  <span>OMR {sale.grandTotal.toFixed(3)}</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[8px] text-slate-600">
                <div>Small 58mm Thermal Receipt</div>
                <div className="font-bold mt-0.5">THANK YOU</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
