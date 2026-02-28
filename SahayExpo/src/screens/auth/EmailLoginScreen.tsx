import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Heart, Mail, User, ArrowRight, Users } from 'lucide-react-native';
import { useThemeColors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useSahay } from '../../lib/sahay-context';
import { api } from '../../lib/api';

export function EmailLoginScreen() {
  const { login } = useSahay();
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'caregiver' | 'care_receiver' | null>(null);
  const [step, setStep] = useState<'email' | 'details'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await api.auth.login({ email: email.trim() });
      if (!data.is_new) {
        login(data.user, data.care_relationship);
      } else {
        setStep('details');
      }
    } catch (e: any) {
      if (e.message?.includes('Name and role')) {
        setStep('details');
      } else {
        setError(e.message || 'Could not connect to server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !role) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await api.auth.login({ email: email.trim(), name: name.trim(), role });
      login(data.user, data.care_relationship);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '15' }]}>
            <Heart color={colors.primary} size={40} strokeWidth={1.5} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome to Sahay+</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {step === 'email' ? 'Sign in to continue' : 'Tell us about yourself'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === 'email' ? (
            <>
              <Input
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                icon={<Mail color={colors.mutedForeground} size={20} />}
              />
              <Button
                title="Continue"
                onPress={handleEmailSubmit}
                disabled={!email.trim()}
                loading={isLoading}
                fullWidth
                size="lg"
                icon={!isLoading ? <ArrowRight color={colors.primaryForeground} size={20} /> : undefined}
              />
            </>
          ) : (
            <>
              <Input
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                autoFocus
                icon={<User color={colors.mutedForeground} size={20} />}
              />
              <Text style={[styles.roleLabel, { color: colors.mutedForeground }]}>
                How will you use Sahay+?
              </Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  onPress={() => setRole('caregiver')}
                  style={[
                    styles.roleCard,
                    {
                      borderColor: role === 'caregiver' ? colors.primary : colors.border,
                      backgroundColor: role === 'caregiver' ? colors.primary + '08' : colors.card,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Users color={role === 'caregiver' ? colors.primary : colors.mutedForeground} size={28} />
                  <Text style={[styles.roleName, { color: colors.foreground }]}>Caregiver</Text>
                  <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>I care for someone</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole('care_receiver')}
                  style={[
                    styles.roleCard,
                    {
                      borderColor: role === 'care_receiver' ? colors.sahayBlue : colors.border,
                      backgroundColor: role === 'care_receiver' ? colors.sahayBlue + '08' : colors.card,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Heart color={role === 'care_receiver' ? colors.sahayBlue : colors.mutedForeground} size={28} />
                  <Text style={[styles.roleName, { color: colors.foreground }]}>Care Receiver</Text>
                  <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>I manage my care</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Get Started"
                onPress={handleSignup}
                disabled={!name.trim() || !role}
                loading={isLoading}
                fullWidth
                size="lg"
                icon={!isLoading ? <ArrowRight color={colors.primaryForeground} size={20} /> : undefined}
              />

              <TouchableOpacity onPress={() => setStep('email')} style={styles.backBtn}>
                <Text style={[styles.backText, { color: colors.mutedForeground }]}>← Use a different email</Text>
              </TouchableOpacity>
            </>
          )}

          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          ) : null}
        </View>

        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Everyday care, made a little easier.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing[6] },
  logoSection: { alignItems: 'center', marginBottom: Spacing[10] },
  logoCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[6] },
  title: { fontSize: FontSize['3xl'], fontFamily: FontFamily.semiBold, marginBottom: Spacing[2] },
  subtitle: { fontSize: FontSize.lg, fontFamily: FontFamily.regular },
  form: { gap: Spacing[4] },
  roleLabel: { fontSize: FontSize.base, fontFamily: FontFamily.regular, textAlign: 'center', marginTop: Spacing[2] },
  roleRow: { flexDirection: 'row', gap: Spacing[3] },
  roleCard: { flex: 1, padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, gap: Spacing[2] },
  roleName: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold },
  roleDesc: { fontSize: FontSize.sm, fontFamily: FontFamily.regular },
  backBtn: { paddingVertical: Spacing[2], alignItems: 'center' },
  backText: { fontSize: FontSize.base, fontFamily: FontFamily.regular },
  error: { fontSize: FontSize.base, fontFamily: FontFamily.medium, textAlign: 'center', marginTop: Spacing[2] },
  tagline: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, textAlign: 'center', marginTop: Spacing[12] },
});
