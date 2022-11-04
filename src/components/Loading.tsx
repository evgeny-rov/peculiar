interface Props {
  bars: number;
  width?: number | string;
  height?: number | string;
  color: string;
  strokeWidth: number;
}

const Loading = ({ strokeWidth, color, bars, ...restProps }: Props) => {
  const svgWidth = 100;
  const svgHeight = svgWidth / 3;
  const centerY = svgHeight / 2;

  const barSize = svgWidth / bars;

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...restProps}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      {Array(bars)
        .fill(null)
        .map((_, idx) => {
          const startX = idx * barSize + barSize / 2;
          const endX = startX;
          const begin = idx * 0.15;
          const dur = 2;

          return (
            <g key={idx}>
              <line
                x1={startX}
                x2={endX}
                y1={centerY}
                y2={centerY}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                stroke={color}
              >
                <animate
                  attributeName="opacity"
                  dur={dur}
                  values="0;1;0"
                  repeatCount="indefinite"
                  begin={begin}
                />
              </line>
            </g>
          );
        })}
    </svg>
  );
};

export default Loading;
