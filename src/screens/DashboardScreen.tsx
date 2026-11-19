import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ApiError,
  logout,
  metadata,
  recentFlows,
  summary,
  timeline,
  type FlowRecord,
  type Identity,
  type ModelMetadata,
  type Summary,
  type TimelinePoint,
} from "../api";
import { colors, space } from "../theme";
import { LiveView } from "./LiveView";
import { SystemView } from "./SystemView";

type Props = {
  identity: Identity;
  onLogout: () => void;
};

type Tab = "live" | "system";

const THRESHOLD = 0.7;

export function DashboardScreen({ identity, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("live");
  const [summaryData, setSummaryData] = useState<Summary | null>(null);
  const [points, setPoints] = useState<TimelinePoint[]>([]);
  const [recent, setRecent] = useState<FlowRecord[]>([]);
  const [engine, setEngine] = useState<ModelMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [nextSummary, nextTimeline, nextRecent] = await Promise.all([
          summary(THRESHOLD),
          timeline(THRESHOLD, 30),
          recentFlows(THRESHOLD, 8),
        ]);
        if (!active) return;
        setSummaryData(nextSummary);
        setPoints(nextTimeline);
        setRecent(nextRecent);
        setError(null);
      } catch (caught) {
        if (!active) return;
        if (caught instanceof ApiError && caught.status === 401) {
          await logout().catch(() => undefined);
          onLogout();
          return;
        }
        setError(caught instanceof Error ? caught.message : "Connection lost");
      }
    }

    metadata()
      .then((value) => {
        if (active) setEngine(value);
      })
      .catch(() => undefined);

    load();
    const timer = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  async function signOut() {
    await logout().catch(() => undefined);
    onLogout();
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.wordmark}>VORTEMIS.IO</Text>
          <Text style={styles.identity}>
            {identity.username} · {identity.role}
          </Text>
        </View>
        <Pressable onPress={signOut} hitSlop={12}>
          <Text style={styles.signout}>SIGN OUT</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {tab === "live" ? (
          <LiveView
            summaryData={summaryData}
            points={points}
            recent={recent}
            engine={engine}
            error={error}
          />
        ) : (
          <SystemView
            identity={identity}
            engine={engine}
            summaryData={summaryData}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        {(["live", "system"] as Tab[]).map((item) => {
          const active = tab === item;
          return (
            <Pressable
              key={item}
              style={styles.tabItem}
              onPress={() => setTab(item)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  active ? styles.tabLabelActive : null,
                ]}
              >
                {item.toUpperCase()}
              </Text>
              <View
                style={[
                  styles.tabMarker,
                  active ? styles.tabMarkerActive : null,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.rule,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  wordmark: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  identity: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 3,
    textTransform: "uppercase",
  },
  signout: {
    color: colors.accentSoft,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  body: {
    flex: 1,
  },
  tabBar: {
    borderTopColor: colors.rule,
    borderTopWidth: 1,
    flexDirection: "row",
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    gap: 7,
    paddingBottom: space.sm,
    paddingTop: space.sm + 2,
  },
  tabLabel: {
    color: colors.faint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
  },
  tabLabelActive: {
    color: colors.text,
  },
  tabMarker: {
    backgroundColor: "transparent",
    borderRadius: 2,
    height: 2,
    width: 22,
  },
  tabMarkerActive: {
    backgroundColor: colors.accentSoft,
  },
});
