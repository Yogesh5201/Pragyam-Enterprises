import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { MobileAuthProvider, useMobileAuth } from './context/MobileAuthContext';
import { COLORS } from './constants/theme';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { BuyerCatalogScreen } from './screens/BuyerCatalogScreen';
import { BuyerRequirementsScreen } from './screens/BuyerRequirementsScreen';
import { SellerStockScreen } from './screens/SellerStockScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { DispatchScreen } from './screens/DispatchScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';

function MainAppNavigator() {
  const { role, language, isAuthenticated } = useMobileAuth();
  const [inWelcomeFlow, setInWelcomeFlow] = useState(false);
  const [currentTab, setCurrentTab] = useState<'catalog' | 'requirements' | 'stock' | 'orders' | 'dispatch' | 'notifications' | 'profile'>('catalog');

  if (inWelcomeFlow || !isAuthenticated) {
    return <WelcomeScreen onEnterApp={() => setInWelcomeFlow(false)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.brandRow}>
          <Text style={styles.logoIcon}>🌾</Text>
          <View>
            <Text style={styles.headerTitle}>PRAGYAM ENTERPRISES</Text>
            <Text style={styles.headerSub}>
              {role === 'BUYER' ? 'Buyer Procurement Desk' : 'Rice Miller Supply Desk'} • Tohana
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={() => setCurrentTab('notifications')}
            style={[styles.bellBtn, currentTab === 'notifications' && styles.bellBtnActive]}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setInWelcomeFlow(true)}
            style={styles.switchRolePill}
          >
            <Text style={styles.switchRoleText}>Switch</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Screen Body */}
      <View style={styles.body}>
        {currentTab === 'notifications' ? (
          <NotificationsScreen />
        ) : role === 'BUYER' ? (
          <>
            {currentTab === 'catalog' && <BuyerCatalogScreen />}
            {currentTab === 'requirements' && <BuyerRequirementsScreen />}
            {currentTab === 'orders' && <OrdersScreen />}
            {currentTab === 'dispatch' && <DispatchScreen />}
            {currentTab === 'profile' && <ProfileScreen onReturnToWelcome={() => setInWelcomeFlow(true)} />}
          </>
        ) : (
          <>
            {currentTab === 'stock' && <SellerStockScreen />}
            {currentTab === 'orders' && <OrdersScreen />}
            {currentTab === 'dispatch' && <DispatchScreen />}
            {currentTab === 'profile' && <ProfileScreen onReturnToWelcome={() => setInWelcomeFlow(true)} />}
            {currentTab === 'catalog' && <SellerStockScreen />}
            {currentTab === 'requirements' && <SellerStockScreen />}
          </>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        {role === 'BUYER' ? (
          <>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('catalog')}
            >
              <Text style={[styles.tabIcon, currentTab === 'catalog' && styles.tabActive]}>🌾</Text>
              <Text style={[styles.tabLabel, currentTab === 'catalog' && styles.tabLabelActive]}>
                {language === 'hi' ? 'स्टॉक' : 'Stock'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('requirements')}
            >
              <Text style={[styles.tabIcon, currentTab === 'requirements' && styles.tabActive]}>📋</Text>
              <Text style={[styles.tabLabel, currentTab === 'requirements' && styles.tabLabelActive]}>
                {language === 'hi' ? 'मांग' : 'Require'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('orders')}
            >
              <Text style={[styles.tabIcon, currentTab === 'orders' && styles.tabActive]}>📦</Text>
              <Text style={[styles.tabLabel, currentTab === 'orders' && styles.tabLabelActive]}>
                {language === 'hi' ? 'आदेश' : 'Orders'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('dispatch')}
            >
              <Text style={[styles.tabIcon, currentTab === 'dispatch' && styles.tabActive]}>🚚</Text>
              <Text style={[styles.tabLabel, currentTab === 'dispatch' && styles.tabLabelActive]}>
                {language === 'hi' ? 'ट्रैकिंग' : 'Track'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('notifications')}
            >
              <Text style={[styles.tabIcon, currentTab === 'notifications' && styles.tabActive]}>🔔</Text>
              <Text style={[styles.tabLabel, currentTab === 'notifications' && styles.tabLabelActive]}>
                {language === 'hi' ? 'सूचनाएं' : 'Alerts'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('profile')}
            >
              <Text style={[styles.tabIcon, currentTab === 'profile' && styles.tabActive]}>👤</Text>
              <Text style={[styles.tabLabel, currentTab === 'profile' && styles.tabLabelActive]}>
                {language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('stock')}
            >
              <Text style={[styles.tabIcon, currentTab === 'stock' && styles.tabActive]}>🏭</Text>
              <Text style={[styles.tabLabel, currentTab === 'stock' && styles.tabLabelActive]}>
                {language === 'hi' ? 'मेरा स्टॉक' : 'My Stock'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('orders')}
            >
              <Text style={[styles.tabIcon, currentTab === 'orders' && styles.tabActive]}>📦</Text>
              <Text style={[styles.tabLabel, currentTab === 'orders' && styles.tabLabelActive]}>
                {language === 'hi' ? 'आदेश' : 'Orders'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('dispatch')}
            >
              <Text style={[styles.tabIcon, currentTab === 'dispatch' && styles.tabActive]}>🚚</Text>
              <Text style={[styles.tabLabel, currentTab === 'dispatch' && styles.tabLabelActive]}>
                {language === 'hi' ? 'डिस्पैच' : 'Dispatch'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('notifications')}
            >
              <Text style={[styles.tabIcon, currentTab === 'notifications' && styles.tabActive]}>🔔</Text>
              <Text style={[styles.tabLabel, currentTab === 'notifications' && styles.tabLabelActive]}>
                {language === 'hi' ? 'सूचनाएं' : 'Alerts'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setCurrentTab('profile')}
            >
              <Text style={[styles.tabIcon, currentTab === 'profile' && styles.tabActive]}>👤</Text>
              <Text style={[styles.tabLabel, currentTab === 'profile' && styles.tabLabelActive]}>
                {language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <MobileAuthProvider>
      <MainAppNavigator />
    </MobileAuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  headerBar: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.3)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '700',
  },
  switchRolePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  switchRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FEF3C7',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellBtn: {
    position: 'relative',
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bellBtnActive: {
    backgroundColor: 'rgba(197, 160, 89, 0.3)',
  },
  bellIcon: {
    fontSize: 15,
  },
  badgePill: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    minWidth: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  tabActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
