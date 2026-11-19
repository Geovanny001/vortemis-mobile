import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  apiBase,
  type Identity,
  type ModelMetadata,
  type Summary,
} from "../api";
import {
  TACTIC_ORDER,
  formatInt,
  formatRate,
  tacticName,
} from "../format";
import { colors, space } from "../theme";

type Props = {
  identity: Identity;
  engine: ModelMetadata | null;
  summaryData: Summary | null;
};

const THRESHOLD = 0.7;
const FEATURE_NAMES = [
  "Inter-Arrival Time (log)",
  "Bytes Sent (log)",
  "Bytes Received (log)",
  "Duration (log)",
  "Upload/Download Ratio (PCR)",
  "Failed Connection Flag",
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function SystemView({ identity, engine, summaryData }: Props) {
  const total = summaryData?.total_flows ?? 0;
  const anomalies = summaryData?.anomalies ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>PASSIVE SOC TELEMETRY</Text>
        <Text style={styles.heroTitle}>Vortemis.io</Text>
        <Text style={styles.heroLead}>
          Six flow features, a PyTorch autoencoder and five MITRE ATT&CK
          network tactics. Read-only operator console.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Engine</Text>
      <View style={styles.card}>
        <Row label="Model" value={engine?.architecture ?? "—"} />
        <Row
          label="Features"
          value={engine ? String(engine.feature_dim) : "—"}
        />
        <Row
          label="Tau (p95)"
          value={engine ? engine.tau.toFixed(4) : "—"}
        />
        <Row label="Epsilon" value={THRESHOLD.toFixed(2)} />
      </View>

      <Text style={styles.sectionLabel}>Telemetry</Text>
      <View style={styles.card}>
        <Row label="Flows" value={formatInt(total)} />
        <Row label="Anomalies" value={formatInt(anomalies)} />
        <Row label="Anomaly rate" value={formatRate(anomalies, total)} />
      </View>

      <Text style={styles.sectionLabel}>Feature baseline</Text>
      <View style={styles.card}>
        {FEATURE_NAMES.map((name, index) => (
          <View key={name} style={styles.featureRow}>
            <Text style={styles.featureName}>{name}</Text>
            <Text style={styles.featureValue}>
              μ {engine?.mean?.[index]?.toFixed(3) ?? "—"}
            </Text>
            <Text style={styles.featureValue}>
              σ {engine?.std?.[index]?.toFixed(3) ?? "—"}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Session</Text>
      <View style={styles.card}>
        <Row label="Operator" value={identity.username} />
        <Row label="Role" value={identity.role} />
        <Row label="API" value={apiBase()} />
      </View>

      <Text style={styles.sectionLabel}>MITRE tactics</Text>
      <View style={styles.card}>
        {TACTIC_ORDER.map((id) => (
          <View key={id} style={styles.tacticRow}>
            <Text style={styles.tacticName}>{tacticName(id)}</Text>
            <Text style={styles.tacticId}>{id}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Vortemis.io · passive network anomaly detection
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space.lg,
    paddingBottom: space.xl,
  },
  hero: {
    backgroundColor: colors.surface,
    borderColor: colors.ruleStrong,
    borderRadius: 14,
    borderWidth: 1,
    padding: space.lg,
  },
  heroKicker: {
    color: colors.accentSoft,
    fontSize: 9,
    letterSpacing: 2,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: space.xs,
  },
  heroLead: {
    color: colors.muted,
    fontSize: 12.5,
    lineHeight: 19,
    marginTop: space.sm,
  },
  sectionLabel: {
    color: colors.faint,
    fontSize: 10,
    letterSpacing: 1.6,
    marginBottom: space.sm,
    marginTop: space.lg,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: colors.raised,
    borderColor: colors.rule,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  row: {
    alignItems: "center",
    borderBottomColor: colors.rule,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  rowLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  rowValue: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 12,
    marginLeft: space.md,
    textAlign: "right",
  },
  featureRow: {
    alignItems: "center",
    borderBottomColor: colors.rule,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingVertical: 9,
  },
  featureName: {
    color: colors.text,
    flex: 1,
    fontSize: 11.5,
  },
  featureValue: {
    color: colors.muted,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    marginLeft: space.sm,
    textAlign: "right",
    width: 66,
  },
  tacticRow: {
    alignItems: "center",
    borderBottomColor: colors.rule,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
  },
  tacticName: {
    color: colors.text,
    fontSize: 12,
  },
  tacticId: {
    color: colors.accentSoft,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  footer: {
    color: colors.faint,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: space.xl,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
