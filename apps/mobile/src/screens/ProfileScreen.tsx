import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants/theme';
import { useMobileAuth } from '../context/MobileAuthContext';

export function ProfileScreen({ onReturnToWelcome }: { onReturnToWelcome: () => void }) {
  const { role, setRole, language, setLanguage, companyName, logout } = useMobileAuth();

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{companyName.charAt(0)}</Text>
        </View>
        <Text style={styles.companyTitle}>{companyName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role === 'BUYER' ? 'BUYER / PURCHASER' : 'RICE MILLER / SELLER'}</Text>
        </View>
      </View>

      {/* Switch Mode Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trading Mode Switcher</Text>
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[styles.modeBtn, role === 'BUYER' && styles.modeBtnActive]}
            onPress={() => setRole('BUYER')}
          >
            <Text style={[styles.modeBtnText, role === 'BUYER' && styles.modeBtnTextActive]}>
              Buyer Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, role === 'SELLER' && styles.modeBtnActive]}
            onPress={() => setRole('SELLER')}
          >
            <Text style={[styles.modeBtnText, role === 'SELLER' && styles.modeBtnTextActive]}>
              Seller Mode
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Switch */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Language</Text>
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[styles.modeBtn, language === 'en' && styles.modeBtnActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.modeBtnText, language === 'en' && styles.modeBtnTextActive]}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, language === 'hi' && styles.modeBtnActive]}
            onPress={() => setLanguage('hi')}
          >
            <Text style={[styles.modeBtnText, language === 'hi' && styles.modeBtnTextActive]}>
              हिंदी (Hindi)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyBox}>
        <Text style={styles.privacyTitle}>🔒 Absolute Intermediary Protection</Text>
        <Text style={styles.privacyText}>
          Pragyam Enterprises enforces backend-level masking. Your contact numbers, mill locations, and identities are never visible to cross-parties.
        </Text>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          logout();
          onReturnToWelcome();
        }}
      >
        <Text style={styles.logoutText}>Sign Out & Switch Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.accent,
  },
  companyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  roleBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  switchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  privacyBox: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#F4F2EC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '800',
  },
});
