import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';
import { useMobileAuth } from '../context/MobileAuthContext';

export function DispatchScreen() {
  const { language } = useMobileAuth();

  const STEPS = [
    { title: 'Transport Assigned', desc: 'HR-05-AU-9821 allocated by broker desk', done: true, time: '27 Oct, 15:00' },
    { title: 'Vehicle Loaded', desc: '2000 bags (50kg) loaded at Taraori facility', done: true, time: '28 Oct, 09:00' },
    { title: 'Cleared Weighbridge & Dispatched', desc: 'Bilty LR-KNL-2026-7844 generated', done: true, time: '28 Oct, 18:00' },
    { title: 'In Transit', desc: 'Crossed Panipat Toll, approaching destination', done: true, active: true, time: '29 Oct, 08:00' },
    { title: 'Destination Delivery Inspection', desc: 'Unloading and SGS sampling verification', done: false, time: 'Expected 30 Oct' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {language === 'hi' ? 'परिवहन एवं बिल्टी ट्रैकिंग' : 'Transport & Bilty (LR) Tracking'}
        </Text>
        <Text style={styles.subtitle}>
          Active Consignment: PE-PO-2026-001 (100 MT Basmati)
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.label}>Vehicle Number</Text>
            <Text style={styles.valMono}>HR-05-AU-9821</Text>
          </View>
          <View>
            <Text style={styles.label}>Bilty (LR) Number</Text>
            <Text style={styles.valMonoPrimary}>LR-KNL-2026-7844</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.label}>Driver Name</Text>
            <Text style={styles.val}>Sarabjeet Singh</Text>
          </View>
          <View>
            <Text style={styles.label}>Driver Phone</Text>
            <Text style={styles.val}>+91 94160 22334</Text>
          </View>
        </View>

        {/* Timeline */}
        <Text style={styles.timelineHeader}>Logistics Progression Timeline</Text>
        <View style={styles.timeline}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={[styles.dot, s.done && styles.dotDone, s.active && styles.dotActive]} />
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={[styles.stepTitle, s.done && styles.stepTitleDone]}>{s.title}</Text>
                  <Text style={styles.stepTime}>{s.time}</Text>
                </View>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  val: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  valMono: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
    color: COLORS.textDark,
  },
  valMonoPrimary: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'System',
    color: COLORS.primary,
  },
  timelineHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  timeline: {
    paddingLeft: 6,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginTop: 3,
    marginRight: 10,
  },
  dotDone: {
    backgroundColor: COLORS.success,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  stepTitleDone: {
    fontWeight: '800',
    color: COLORS.textDark,
  },
  stepTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  stepDesc: {
    fontSize: 11,
    color: '#64748B',
  },
});
