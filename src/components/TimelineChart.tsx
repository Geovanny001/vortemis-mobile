import { View } from "react-native";
import Svg, { Circle, Polygon, Polyline } from "react-native-svg";

import type { TimelinePoint } from "../api";
import { colors } from "../theme";

type Props = {
  points: TimelinePoint[];
  width: number;
  height?: number;
};

export function TimelineChart({ points, width, height = 130 }: Props) {
  if (!points.length || width <= 0) {
    return <View style={{ height }} />;
  }

  const pad = 6;
  const max = Math.max(...points.map((point) => point.flows), 1);
  const maxAnomalies = Math.max(
    ...points.map((point) => point.anomalies),
    1,
  );
  const step =
    points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const toY = (value: number) =>
    height - pad - (value / max) * (height - pad * 2);

  const coords = points.map((point, index) => ({
    x: pad + index * step,
    y: toY(point.flows),
  }));
  const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const baseline = height - pad;
  const area =
    `${pad},${baseline} ` +
    `${line} ` +
    `${pad + (points.length - 1) * step},${baseline}`;

  return (
    <Svg width={width} height={height}>
      <Polygon points={area} fill="rgba(196, 181, 253, 0.12)" />
      <Polyline
        points={line}
        fill="none"
        stroke={colors.accentSoft}
        strokeWidth={1.5}
      />
      {points.map((point, index) =>
        point.anomalies > 0 ? (
          <Circle
            key={`${point.bucket_start}-${index}`}
            cx={coords[index].x}
            cy={coords[index].y}
            r={2 + (point.anomalies / maxAnomalies) * 3}
            fill={colors.alert}
          />
        ) : null,
      )}
    </Svg>
  );
}
