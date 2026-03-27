import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { DepositReceiptData } from '@/domain/deposit-receipt/types';

// Register Poppins fonts from public/
Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/Poppins-Light.ttf', fontWeight: 300 },
    { src: '/Poppins-Black.ttf', fontWeight: 900 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Poppins',
    fontSize: 11,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    borderBottom: '2px solid #8B1A4A',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 900,
    color: '#8B1A4A',
  },
  companySubtitle: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: 900,
    color: '#8B1A4A',
    textAlign: 'right',
  },
  receiptDate: {
    fontSize: 9,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: '#8B1A4A',
    marginBottom: 10,
    marginTop: 20,
    borderBottom: '1px solid #ddd',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontWeight: 900,
    width: 160,
    color: '#555',
  },
  value: {
    flex: 1,
    fontWeight: 300,
  },
  descriptionBox: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 4,
    marginTop: 5,
    marginBottom: 10,
    border: '1px solid #eee',
  },
  descriptionText: {
    fontWeight: 300,
    lineHeight: 1.5,
  },
  totalsBox: {
    backgroundColor: '#FDF2F8',
    padding: 15,
    borderRadius: 4,
    marginTop: 15,
    border: '1px solid #F9D5E5',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontWeight: 300,
    color: '#555',
  },
  totalValue: {
    fontWeight: 900,
    color: '#333',
  },
  priceHighlight: {
    fontWeight: 900,
    fontSize: 14,
    color: '#8B1A4A',
  },
  separator: {
    borderBottom: '1px dashed #ccc',
    marginVertical: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1px solid #ddd',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#999',
    fontWeight: 300,
  },
  signatureArea: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: 200,
    borderTop: '1px solid #333',
    paddingTop: 5,
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
});

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number): string {
  return `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface DepositReceiptPDFProps {
  data: DepositReceiptData;
}

export function DepositReceiptPDF({ data }: DepositReceiptPDFProps) {
  const emissionDate = data.createdAt ? formatDate(data.createdAt) : formatDate(new Date().toISOString());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>GIOIA EXPRESO</Text>
            <Text style={styles.companySubtitle}>Transporte y Logística</Text>
          </View>
          <View>
            <Text style={styles.receiptLabel}>RECIBO DE DEPÓSITO</Text>
            <Text style={styles.receiptDate}>Fecha de emisión: {emissionDate}</Text>
            {data.id && (
              <Text style={styles.receiptDate}>ID: {data.id.substring(0, 8).toUpperCase()}</Text>
            )}
          </View>
        </View>

        {/* Client Info */}
        <Text style={styles.sectionTitle}>Datos del Cliente</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre completo:</Text>
          <Text style={styles.value}>{data.firstName} {data.lastName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.cuit ? 'CUIT' : 'DNI'}:</Text>
          <Text style={styles.value}>{data.cuit || data.dni || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.email}</Text>
        </View>

        {/* Deposit Details */}
        <Text style={styles.sectionTitle}>Detalle del Depósito</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Descripción:</Text>
        </View>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{data.description}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha estimada de retiro:</Text>
          <Text style={styles.value}>{formatDate(data.timeEstimated)}</Text>
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          {data.valueAprox !== undefined && data.valueAprox !== null && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Valor aproximado declarado:</Text>
                <Text style={styles.totalValue}>{formatCurrency(data.valueAprox)}</Text>
              </View>
              <View style={styles.separator} />
            </>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Precio cobrado por almacenamiento:</Text>
            <Text style={styles.priceHighlight}>{formatCurrency(data.price)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Gioia Expreso - Transporte y Logística</Text>
          <Text style={styles.footerText}>www.transportegioia.com.ar</Text>
        </View>
      </Page>
    </Document>
  );
}
