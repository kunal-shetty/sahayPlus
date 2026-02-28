import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link2, ArrowRight, Heart } from 'lucide-react-native';
import { useThemeColors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useSahay } from '../../lib/sahay-context';

export function EnterCareCodeScreen() {
  const { linkCareCode, user, logout } = useSahay();
  const colors = useThemeColors();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!code.trim() || code.trim().length < 6) return;
    setIsLoading(true);
    setError('');
    try {
      await linkCareCode(code.trim());
    } catch (e: any) {
      setError(e.message || 'Invalid care code');
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
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
          <Link2 color={colors.primary} size={36} strokeWidth={1.5} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Connect to Care</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Enter the care code shared by the care receiver to link your accounts.
        </Text>

        <Input
          placeholder="Enter 6-digit care code"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          autoFocus
          maxLength={6}
          icon={<Heart color={colors.mutedForeground} size={20} />}
          containerStyle={{ marginTop: Spacing[6] }}
        />

        <Button
          title="Link Account"
          onPress={handleSubmit}
          disabled={code.trim().length < 6}
          loading={isLoading}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing[4] }}
          icon={!isLoading ? <ArrowRight color={colors.primaryForeground} size={20} /> : undefined}
        />

        {error ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        ) : null}

        {user?.role === 'care_receiver' && user.care_code && (
          <View style={[styles.codeBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.codeLabel, { color: colors.mutedForeground }]}>Your care code:</Text>
            <Text style={[styles.codeText, { color: colors.primary }]}>{user.care_code}</Text>
            <Text style={[styles.codeHint, { color: colors.mutedForeground }]}>
              Share this code with your caregiver
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={[styles.logoutText, { color: colors.mutedForeground }]}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing[6] },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing[6] },
  title: { fontSize: FontSize['3xl'], fontFamily: FontFamily.semiBold, textAlign: 'center', marginBottom: Spacing[2] },
  subtitle: { fontSize: FontSize.base, fontFamily: FontFamily.regular, textAlign: 'center', lineHeight: 24 },
  error: { fontSize: FontSize.base, fontFamily: FontFamily.medium, textAlign: 'center', marginTop: Spacing[3] },
  codeBox: { marginTop: Spacing[8], padding: Spacing[5], borderRadius: BorderRadius.xl, borderWidth: 1, alignItems: 'center' },
  codeLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, marginBottom: Spacing[1] },
  codeText: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold, letterSpacing: 4 },
  codeHint: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, marginTop: Spacing[2] },
  logoutBtn: { marginTop: Spacing[8], alignItems: 'center', paddingVertical: Spacing[2] },
  logoutText: { fontSize: FontSize.base, fontFamily: FontFamily.regular },
});
