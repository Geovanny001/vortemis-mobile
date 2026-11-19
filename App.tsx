import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

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

  if (booting) {
    return (
      <View style={styles.boot}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.accentSoft} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {identity ? (
        <DashboardScreen
          identity={identity}
          onLogout={() => setIdentity(null)}
        />
      ) : (
        <LoginScreen onAuthenticated={setIdentity} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  boot: {
    alignItems: "center",
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: "center",
  },
});
