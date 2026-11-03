import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useMobileAuth } from '../context/MobileAuthContext';

// Realistic anonymous stock lots for mobile
const INITIAL_STOCKS = [
  {
    id: 'lst-1025',
    anonymousCode: 'PRG-1025',
    variety: '1121 Golden Sella Basmati',
    category: 'Golden Sella Rice',
    quantityMT: 500,
    pricePerQuintal: 8200,
    grainLength: 8.35,
    whiteness: 40.0,
    moisture: 12.0,
    broken: 1.0,
    sortex: true,
    location: 'Karnal, Haryana Hub',
    cropYear: '2025-2026',
    packaging: 'PP Bag 50kg',
  },
  {
    id: 'lst-1048',
    anonymousCode: 'PRG-1048',
    variety: '1509 Basmati Steam',
    category: 'Steam Rice',
    quantityMT: 350,
    pricePerQuintal: 6800,
    grainLength: 8.40,
    whiteness: 42.5,
    moisture: 12.5,
    broken: 1.5,
    sortex: true,
    location: 'Amritsar, Punjab Hub',
    cropYear: '2025-2026',
    packaging: 'Non-Woven 10kg',
  },
  {
    id: 'lst-1092',
    anonymousCode: 'PRG-1092',
    variety: 'Sona Masoori Raw Old Crop',
    category: 'Raw Rice',
    quantityMT: 800,
    pricePerQuintal: 4800,
    grainLength: 5.20,
    whiteness: 39.0,
    moisture: 13.0,
    broken: 2.0,
    sortex: true,
    location: 'Gondia, Maharashtra Hub',
    cropYear: '2024-2025',
    packaging: 'PP Bag 25kg',
  },
  {
    id: 'lst-2015',
    anonymousCode: 'PRG-2015',
    variety: 'Sugandha White Sella',
    category: 'Sella Rice',
    quantityMT: 450,
    pricePerQuintal: 5400,
    grainLength: 7.85,
    whiteness: 41.0,
    moisture: 12.2,
    broken: 1.2,
    sortex: true,
    location: 'Taraori, Haryana Hub',
    cropYear: '2025-2026',
    packaging: 'PP Bag 50kg',
  },
];

export function BuyerCatalogScreen() {
  const { language } = useMobileAuth();
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [search, setSearch] = useState('');

  const filteredStocks = stocks.filter(
    s =>
      s.variety.toLowerCase().includes(search.toLowerCase()) ||
      s.anonymousCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnquiry = (stock: any) => {
    Alert.alert(
      language === 'hi' ? 'पूछताछ दर्ज करें' : 'Submit Commercial Enquiry',
      language === 'hi'
        ? `स्टॉक ${stock.anonymousCode} (${stock.variety}) के लिए प्रज्ञम ब्रोकरेज डेस्क को पूछताछ भेजी जाएगी। क्या आप आगे बढ़ना चाहते हैं?`
        : `Submit purchase enquiry for ${stock.anonymousCode} (${stock.variety}) to Pragyam Enterprises Brokerage Desk?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send to Broker',
          onPress: () => {
            Alert.alert(
              'Enquiry Dispatched!',
              `Your enquiry for ${stock.anonymousCode} was submitted to Pragyam Enterprises. Our desk broker will contact the mill anonymously and notify your Orders tab.`
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Notice */}
      <View style={styles.topNotice}>
        <Text style={styles.topNoticeText}>
          🔒 {language === 'hi' ? 'गोपनीय सूची: विक्रेता की पहचान सुरक्षित है' : 'Anonymous Stock Directory • Confidential'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'hi' ? 'चावल की किस्म या कोड खोजें...' : 'Search rice variety or stock code...'}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Stock Cards List */}
      <FlatList
        data={filteredStocks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Header: Code & Category */}
            <View style={styles.cardHeader}>
              <View style={styles.badgeCode}>
                <Text style={styles.badgeCodeText}>{item.anonymousCode}</Text>
              </View>
              {item.sortex && (
                <View style={styles.sortexBadge}>
                  <Text style={styles.sortexText}>100% Sortex</Text>
                </View>
              )}
            </View>

            {/* Variety */}
            <Text style={styles.varietyTitle}>{item.variety}</Text>
            <Text style={styles.categorySub}>{item.category} • {item.packaging}</Text>

            {/* Price & Quantity Box */}
            <View style={styles.priceStrip}>
              <View>
                <Text style={styles.labelMuted}>Asking Rate</Text>
                <Text style={styles.priceText}>
                  ₹{item.pricePerQuintal.toLocaleString('en-IN')}{' '}
                  <Text style={styles.perQtl}>/ Quintal</Text>
                </Text>
                <Text style={styles.priceSubText}>
                  (₹{(item.pricePerQuintal * 10).toLocaleString('en-IN')} / MT)
                </Text>
              </View>

              <View style={styles.qtyBox}>
                <Text style={styles.labelMuted}>Available Volume</Text>
                <Text style={styles.qtyText}>{item.quantityMT} MT</Text>
                <Text style={styles.qtySubText}>({item.quantityMT * 10} Qtl)</Text>
              </View>
            </View>

            {/* Specifications Chips */}
            <View style={styles.specsRow}>
              <View style={styles.specChip}>
                <Text style={styles.specLabel}>Length:</Text>
                <Text style={styles.specValue}>{item.grainLength}mm</Text>
              </View>
              <View style={styles.specChip}>
                <Text style={styles.specLabel}>Whiteness:</Text>
                <Text style={styles.specValue}>{item.whiteness}</Text>
              </View>
              <View style={styles.specChip}>
                <Text style={styles.specLabel}>Moisture:</Text>
                <Text style={styles.specValue}>{item.moisture}%</Text>
              </View>
              <View style={styles.specChip}>
                <Text style={styles.specLabel}>Broken:</Text>
                <Text style={styles.specValue}>{item.broken}%</Text>
              </View>
            </View>

            {/* Location & Crop */}
            <View style={styles.originRow}>
              <Text style={styles.originText}>📍 {item.location}</Text>
              <Text style={styles.cropText}>Crop {item.cropYear}</Text>
            </View>

            {/* Enquire Button */}
            <TouchableOpacity
              style={styles.enquireBtn}
              onPress={() => handleEnquiry(item)}
            >
              <Text style={styles.enquireBtnText}>
                {language === 'hi' ? 'खरीद पूछताछ भेजें' : 'Submit Purchase Enquiry'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topNotice: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 6,
    alignItems: 'center',
  },
  topNoticeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textDark,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeCode: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeCodeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sortexBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sortexText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
  },
  varietyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  categorySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  priceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F6',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  labelMuted: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  perQtl: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'normal',
  },
  priceSubText: {
    fontSize: 10,
    color: '#64748B',
  },
  qtyBox: {
    alignItems: 'flex-end',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  qtySubText: {
    fontSize: 10,
    color: '#64748B',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specChip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specLabel: {
    fontSize: 10,
    color: '#64748B',
    marginRight: 4,
  },
  specValue: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  originRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 14,
  },
  originText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  cropText: {
    fontSize: 11,
    color: '#64748B',
  },
  enquireBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  enquireBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
