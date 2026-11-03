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

export function BuyerRequirementsScreen() {
  const { language } = useMobileAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [variety, setVariety] = useState('1121 Golden Sella Basmati');
  const [quantityMT, setQuantityMT] = useState('100');
  const [targetPrice, setTargetPrice] = useState('8100');

  const [myRequirements, setMyRequirements] = useState([
    {
      id: 'req-4081',
      code: 'REQ-4081',
      variety: '1121 Golden Sella Basmati',
      quantityMT: 200,
      targetPrice: 8100,
      status: 'OPEN',
      date: '30 Oct 2026',
    },
    {
      id: 'req-4095',
      code: 'REQ-4095',
      variety: 'Sona Masoori Raw Old Crop',
      quantityMT: 300,
      targetPrice: 4750,
      status: 'UNDER NEGOTIATION',
      date: '31 Oct 2026',
    },
  ]);

  const handleAddRequirement = () => {
    if (!variety || !quantityMT) {
      Alert.alert('Error', 'Please fill variety and quantity');
      return;
    }

    const newReq = {
      id: `req-${Date.now()}`,
      code: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      variety,
      quantityMT: Number(quantityMT),
      targetPrice: Number(targetPrice) || 8000,
      status: 'OPEN',
      date: 'Today',
    };

    setMyRequirements([newReq, ...myRequirements]);
    setModalVisible(false);
    Alert.alert(
      'Requirement Broadcasted',
      'Your procurement requirement was sent to Pragyam Enterprises central matching desk.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <div>
          <Text style={styles.title}>
            {language === 'hi' ? 'मेरी खरीद आवश्यकताएं' : 'My Purchase Requirements'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'hi'
              ? 'प्रज्ञम ब्रोकर आपके लिए स्टॉक खोजेगा और मोलभाव करेगा'
              : 'Pragyam desk continuously matches these with verified mill stocks'}
          </Text>
        </div>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Post New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={myRequirements}
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
                <Text style={styles.dataLabel}>Required Volume</Text>
                <Text style={styles.dataVal}>{item.quantityMT} MT ({item.quantityMT * 10} Qtl)</Text>
              </View>
              <View>
                <Text style={styles.dataLabel}>Target Rate</Text>
                <Text style={styles.priceVal}>₹{item.targetPrice.toLocaleString('en-IN')} / Qtl</Text>
              </View>
              <View>
                <Text style={styles.dataLabel}>Logged Date</Text>
                <Text style={styles.dateVal}>{item.date}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Modal to Post Requirement */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Post Purchase Requirement</Text>

            <Text style={styles.inputLabel}>Rice Variety *</Text>
            <TextInput
              style={styles.modalInput}
              value={variety}
              onChangeText={setVariety}
              placeholder="e.g. 1121 Golden Sella Basmati"
            />

            <Text style={styles.inputLabel}>Quantity Required (MT) *</Text>
            <TextInput
              style={styles.modalInput}
              value={quantityMT}
              onChangeText={setQuantityMT}
              keyboardType="numeric"
              placeholder="e.g. 100"
            />

            <Text style={styles.inputLabel}>Target Price (₹ / Qtl) *</Text>
            <TextInput
              style={styles.modalInput}
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
              placeholder="e.g. 8100"
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
                onPress={handleAddRequirement}
              >
                <Text style={styles.submitText}>Submit Requirement</Text>
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
  dateVal: {
    fontSize: 11,
    color: '#64748B',
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
