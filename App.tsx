import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { hasSession, me, type Identity } from "./src/api";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { colors } from "./src/theme";

export default function App() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        if (await hasSession()) {
          const current = await me();
          if (active) setIdentity(current);
        }
      } catch {
        if (active) setIdentity(null);
      }
      if (active) setBooting(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView
        style={styles.safe}
        edges={["top", "bottom", "left", "right"]}
      >
        {booting ? (
          <View style={styles.boot}>
            <ActivityIndicator color={colors.accentSoft} />
          </View>
        ) : identity ? (
          <DashboardScreen
            identity={identity}
            onLogout={() => setIdentity(null)}
          />
        ) : (
          <LoginScreen onAuthenticated={setIdentity} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  boot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
