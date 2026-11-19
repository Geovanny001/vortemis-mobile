import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type {
  FlowRecord,
  ModelMetadata,
  Summary,
  TimelinePoint,
} from "../api";
import { TimelineChart } from "../components/TimelineChart";
import {
  TACTIC_ORDER,
  formatClock,
  formatInt,
  formatRate,
  probabilityColor,
  tacticName,
} from "../format";
import { colors, space } from "../theme";

type Props = {
  summaryData: Summary | null;
  points: TimelinePoint[];
  recent: FlowRecord[];
  engine: ModelMetadata | null;
  error: string | null;
};

const THRESHOLD = 0.7;

export function LiveView({
  summaryData,
  points,
  recent,
  engine,
  error,
}: Props) {
  const [chartWidth, setChartWidth] = useState(0);

  const total = summaryData?.total_flows ?? 0;
  const anomalies = summaryData?.anomalies ?? 0;
  const byTactic = summaryData?.by_tactic ?? {};
  const maxTactic = Math.max(
    ...TACTIC_ORDER.map((id) => byTactic[id] ?? 0),
    1,
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {engine ? (
        <Text style={styles.pipeline}>
          MODEL {engine.architecture} · TAU {engine.tau.toFixed(4)}
        </Text>
      ) : null}

      <View style={styles.kpis}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>FLOWS</Text>
          <Text style={styles.kpiValue}>{formatInt(total)}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>ANOMALIES</Text>
          <Text style={styles.kpiValue}>{formatInt(anomalies)}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>ANOMALY RATE</Text>
          <Text style={styles.kpiValue}>{formatRate(anomalies, total)}</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.panelTitle}>By tactic</Text>
      <View style={styles.panel}>
        {TACTIC_ORDER.map((id) => {
          const value = byTactic[id] ?? 0;
          const percent = (value / maxTactic) * 100;
          return (
            <View key={id} style={styles.tacticRow}>
              <Text style={styles.tacticName}>{tacticName(id)}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${percent}%` as `${number}%` },
                  ]}
                />
              </View>
              <Text style={styles.tacticValue}>{formatInt(value)}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.panelTitle}>Anomalies over time</Text>
      <View
        style={styles.chart}
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
      >
        <TimelineChart points={points} width={chartWidth} />
      </View>

      <Text style={styles.panelTitle}>Recent detections</Text>
      <View style={styles.panel}>
        {recent.length === 0 ? (
          <Text style={styles.empty}>
            No detections above {THRESHOLD.toFixed(2)} yet.
          </Text>
        ) : (
          recent.map((record) => (
            <View key={record.flow_id} style={styles.detection}>
              <Text style={styles.detectionTime}>
                {formatClock(record.ts)}
              </Text>
              <Text style={styles.detectionFlow} numberOfLines={1}>
                {record.src_ip}:{record.src_port} → {record.dst_ip}:
                {record.dst_port}
              </Text>
              <Text
                style={[
                  styles.detectionProb,
                  { color: probabilityColor(record.anomaly_probability) },
                ]}
              >
                {record.anomaly_probability.toFixed(2)}
              </Text>
              <Text style={styles.detectionTactic} numberOfLines={1}>
                {tacticName(record.mitre_tactic)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space.lg,
    paddingBottom: space.xl,
  },
  pipeline: {
    color: colors.faint,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: space.md,
    textTransform: "uppercase",
  },
  kpis: {
    borderBottomColor: colors.rule,
    borderBottomWidth: 1,
    borderTopColor: colors.rule,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: space.md,
  },
  kpi: {
    gap: 2,
  },
  kpiLabel: {
    color: colors.faint,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  kpiValue: {
    color: colors.text,
    fontSize: 26,
    fontVariant: ["tabular-nums"],
    fontWeight: "300",
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: space.sm,
  },
  panelTitle: {
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 1.6,
    marginBottom: space.sm,
    marginTop: space.lg,
    textTransform: "uppercase",
  },
  panel: {
    borderTopColor: colors.rule,
    borderTopWidth: 1,
    paddingTop: space.sm,
  },
  tacticRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    paddingVertical: 6,
  },
  tacticName: {
    color: colors.text,
    fontSize: 12,
    width: 130,
  },
  barTrack: {
    backgroundColor: colors.surface,
    borderRadius: 3,
    flex: 1,
    height: 6,
    overflow: "hidden",
  },
  barFill: {
    backgroundColor: colors.accentSoft,
    borderRadius: 3,
    height: 6,
  },
  tacticValue: {
    color: colors.muted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    textAlign: "right",
    width: 48,
  },
  chart: {
    borderTopColor: colors.rule,
    borderTopWidth: 1,
    paddingTop: space.sm,
  },
  empty: {
    color: colors.muted,
    fontSize: 12,
    paddingVertical: space.md,
  },
  detection: {
    alignItems: "center",
    borderBottomColor: colors.rule,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingVertical: 9,
  },
  detectionTime: {
    color: colors.muted,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    width: 58,
  },
  detectionFlow: {
    color: colors.text,
    flex: 1,
    fontSize: 11,
  },
  detectionProb: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    textAlign: "right",
    width: 36,
  },
  detectionTactic: {
    color: colors.muted,
    fontSize: 10,
    textAlign: "right",
    width: 92,
  },
});
