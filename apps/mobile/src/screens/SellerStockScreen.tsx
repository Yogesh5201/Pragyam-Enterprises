import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useMobileAuth } from '../context/MobileAuthContext';

export function SellerStockScreen() {
  const { language } = useMobileAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [variety, setVariety] = useState('1121 Golden Sella Basmati');
  const [quantityMT, setQuantityMT] = useState('300');
  const [askingPrice, setAskingPrice] = useState('8200');
  const [brokerageOffered, setBrokerageOffered] = useState('100');

  const [myStock, setMyStock] = useState([
    {
      id: 'lst-1025',
      code: 'PRG-1025',
      variety: '1121 Golden Sella Basmati',
      quantityMT: 500,
      pricePerQuintal: 8200,
      brokerage: 100,
      status: 'ACTIVE',
      dispatchOrigin: 'Taraori Mill Depot',
    },
    {
      id: 'lst-2015',
      code: 'PRG-2015',
      variety: 'Sugandha White Sella',
      quantityMT: 450,
      pricePerQuintal: 5400,
      brokerage: 80,
      status: 'ACTIVE',
      dispatchOrigin: 'Karnal Rail Siding',
    },
  ]);

  const handleAddStock = () => {
    if (!variety || !quantityMT || !askingPrice) {
      Alert.alert('Error', 'Please fill variety, quantity, and asking price');
      return;
    }

    const newListing = {
      id: `lst-${Date.now()}`,
      code: `PRG-${Math.floor(1000 + Math.random() * 9000)}`,
      variety,
      quantityMT: Number(quantityMT),
      pricePerQuintal: Number(askingPrice),
      brokerage: Number(brokerageOffered) || 100,
      status: 'ACTIVE',
      dispatchOrigin: 'Taraori Mill Facility',
    };

    setMyStock([newListing, ...myStock]);
    setModalVisible(false);
    Alert.alert(
      'Stock Auto-Published',
      `Your stock listing ${newListing.code} has been validated and published anonymously to buyers.`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <div>
          <Text style={styles.title}>
            {language === 'hi' ? 'मेरा चावल स्टॉक' : 'My Rice Stock Inventory'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'hi'
              ? 'सत्यापन के बाद खरीदारों को सीधे प्रदर्शित होता है'
              : 'Auto-published anonymously to institutional buyers'}
          </Text>
        </div>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Add Stock</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={myStock}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.codeText}>{item.code}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.varietyText}>{item.variety}</Text>

            <View style={styles.dataRow}>
              <View>
                <Text style={styles.dataLabel}>Available Quantity</Text>
                <Text style={styles.dataVal}>{item.quantityMT} MT ({item.quantityMT * 10} Qtl)</Text>
              </View>
              <View>
                <Text style={styles.dataLabel}>Asking Price</Text>
                <Text style={styles.priceVal}>₹{item.pricePerQuintal.toLocaleString('en-IN')}/Qtl</Text>
              </View>
              <View>
                <Text style={styles.dataLabel}>Commission</Text>
                <Text style={styles.commVal}>₹{item.brokerage}/MT</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Modal to Add Stock */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Rice Stock</Text>

            <Text style={styles.inputLabel}>Rice Variety *</Text>
            <TextInput
              style={styles.modalInput}
              value={variety}
              onChangeText={setVariety}
              placeholder="e.g. 1509 Basmati Steam"
            />

            <Text style={styles.inputLabel}>Available Volume (MT) *</Text>
            <TextInput
              style={styles.modalInput}
              value={quantityMT}
              onChangeText={setQuantityMT}
              keyboardType="numeric"
              placeholder="e.g. 200"
            />

            <Text style={styles.inputLabel}>Asking Rate (₹ / Qtl) *</Text>
            <TextInput
              style={styles.modalInput}
              value={askingPrice}
              onChangeText={setAskingPrice}
              keyboardType="numeric"
              placeholder="e.g. 6800"
            />

            <Text style={styles.inputLabel}>Brokerage Offered (₹ / MT)</Text>
            <TextInput
              style={styles.modalInput}
              value={brokerageOffered}
              onChangeText={setBrokerageOffered}
              keyboardType="numeric"
              placeholder="e.g. 100"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddStock}
              >
                <Text style={styles.submitText}>Publish Stock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    maxWidth: 220,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'System',
    color: COLORS.primary,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
  varietyText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dataLabel: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  dataVal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  priceVal: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  commVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
