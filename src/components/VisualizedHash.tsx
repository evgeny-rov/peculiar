const splitIntoChunks = (str: string, chunkSize: number) =>
  str.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];

const hexToBase10 = (value: string) => parseInt(value, 16);

interface Props {
  data: string;
  width?: number | string;
  height?: number | string;
  color: string;
  strokeWidth: number;
  showTracks?: boolean;
}

const VisualizedHash = ({ data, strokeWidth, color, showTracks, ...restProps }: Props) => {
  const svgWidth = 100;
  const svgHeight = svgWidth / 3;
  const centerY = svgHeight / 2;

  const chunkSize = 8;
  const dataInChunks = splitIntoChunks(data, chunkSize);
  const cells = dataInChunks.length;
  const cellSize = svgWidth / cells;

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...restProps}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      {dataInChunks.map((chunk, idx) => {
        const startX = idx * cellSize + cellSize / 2;
        const endX = startX;
        const paddingY = svgHeight / 10;

        const itemHeight = Math.max((hexToBase10(chunk) % svgHeight) - paddingY * 2, 0);

        const startY = centerY - itemHeight / 2;
        const endY = centerY + itemHeight / 2;

        return (
          <g key={idx}>
            {showTracks && (
              <line
                x1={startX}
                y1={paddingY}
                x2={endX}
                y2={svgHeight - paddingY}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                stroke={color}
                opacity={0.1}
              />
            )}
            <line
              x1={startX}
              y1={centerY}
              x2={endX}
              y2={centerY}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              stroke={color}
            >
              <animate attributeName="y1" from={centerY} to={startY} dur="0.5s" fill="freeze" />
              <animate attributeName="y2" from={centerY} to={endY} dur="0.5s" fill="freeze" />
            </line>
          </g>
        );
      })}
    </svg>
  );
};

export default VisualizedHash;
