export default function CmykNum({
  value,
  fontSize = 64,
  style,
}: {
  value: string;
  fontSize?: number | string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="cmyk-num"
      style={{ fontSize, fontWeight: 600, ...style }}
    >
      <span className="paper">{value}</span>
      <span className="plate plate-c" aria-hidden="true">
        {value}
      </span>
      <span className="plate plate-m" aria-hidden="true">
        {value}
      </span>
      <span className="plate plate-y" aria-hidden="true">
        {value}
      </span>
    </div>
  );
}
