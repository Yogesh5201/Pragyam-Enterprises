import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../constants/theme';
import { useMobileAuth } from '../context/MobileAuthContext';

export function WelcomeScreen({ onEnterApp }: { onEnterApp: () => void }) {
  const { language, setLanguage, login } = useMobileAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Language Selector Top Right */}
      <View style={styles.langContainer}>
        <TouchableOpacity
          onPress={() => setLanguage('en')}
          style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
        >
          <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage('hi')}
          style={[styles.langBtn, language === 'hi' && styles.langBtnActive]}
        >
          <Text style={[styles.langText, language === 'hi' && styles.langTextActive]}>हिंदी</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerContent}>
        {/* Logo Emblem */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>🌾</Text>
        </View>

        <Text style={styles.brandTitle}>PRAGYAM</Text>
        <Text style={styles.brandSubtitle}>ENTERPRISES</Text>

        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>
            {language === 'hi' ? 'गोपनीय चावल ब्रोकरेज प्लेटफॉर्म' : 'CONFIDENTIAL RICE BROKERAGE'}
          </Text>
        </View>

        <Text style={styles.description}>
          {language === 'hi'
            ? 'भारत का प्रमुख अंतर-व्यापार अनाज ब्रोकरेज नेटवर्क। खरीदार और मिलर गोपनीयता, डिजिटल खरीद आदेश और सुरक्षित व्यापार प्रबंधन।'
            : 'Premier institutional grain trading intermediary. Enforcing absolute confidentiality: structured contracts, AGMARK-compliant specifications, and transparent settlements.'}
        </Text>
      </View>

      {/* Role Selection & Login Options */}
      <View style={styles.footerActions}>
        <Text style={styles.selectRoleLabel}>
          {language === 'hi' ? 'प्रवेश का प्रकार चुनें:' : 'SELECT YOUR TRADING ROLE:'}
        </Text>

        <TouchableOpacity
          style={styles.buyerBtn}
          onPress={() => {
            login('BUYER');
            onEnterApp();
          }}
        >
          <Text style={styles.buyerBtnText}>
            {language === 'hi' ? 'खरीदार / क्रेता के रूप में प्रवेश करें' : 'ENTER AS BUYER / PURCHASER'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sellerBtn}
          onPress={() => {
            login('SELLER');
            onEnterApp();
          }}
        >
          <Text style={styles.sellerBtnText}>
            {language === 'hi' ? 'चावल मिलर / विक्रेता के रूप में प्रवेश करें' : 'ENTER AS SELLER / RICE MILLER'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          {language === 'hi'
            ? 'सख्त मध्यस्थता: व्यापार गोपनीयता की रक्षा के लिए सीधा संपर्क निषिद्ध है।'
            : 'Direct buyer-seller communication is strictly prohibited to safeguard trade confidentiality.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  langContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 8,
  },
  langBtnActive: {
    backgroundColor: COLORS.accent,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  langTextActive: {
    color: COLORS.primaryDark,
  },
  centerContent: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 40,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 4,
    marginBottom: 12,
  },
  pillBadge: {
    backgroundColor: 'rgba(197, 160, 89, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.5)',
    marginBottom: 16,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FEF3C7',
    letterSpacing: 1,
  },
  description: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  footerActions: {
    width: '100%',
    paddingBottom: 16,
  },
  selectRoleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  buyerBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  buyerBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sellerBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  sellerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
});
