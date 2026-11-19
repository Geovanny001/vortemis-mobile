import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  apiBase,
  login,
  setApiBase,
  type Identity,
} from "../api";
import { colors, space } from "../theme";

type Props = {
  onAuthenticated: (identity: Identity) => void;
};

export function LoginScreen({ onAuthenticated }: Props) {
  const [username, setUsername] = useState("admin_carles");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState(apiBase());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setApiBase(server);
      const identity = await login(username.trim(), password);
      onAuthenticated(identity);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.wordmark}>VORTEMIS.IO</Text>
        <Text style={styles.lead}>
          Passive network telemetry. Sign in to watch flows, anomalies and
          MITRE tactics in real time.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="admin_carles"
            placeholderTextColor={colors.faint}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.faint}
          />

          <Text style={styles.label}>API base</Text>
          <TextInput
            style={[styles.input, styles.serverInput]}
            value={server}
            onChangeText={setServer}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed ? styles.buttonPressed : null,
            ]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.buttonText}>SIGN IN</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: space.lg,
  },
  wordmark: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },
  lead: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: space.sm,
    marginBottom: space.xl,
  },
  form: {
    gap: space.xs,
  },
  label: {
    color: colors.faint,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: space.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.rule,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
  serverInput: {
    color: colors.muted,
    fontSize: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: space.sm,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: 10,
    marginTop: space.lg,
    paddingVertical: space.md,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.bg,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
