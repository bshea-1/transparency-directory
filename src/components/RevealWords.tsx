import type { CSSProperties } from "react";

interface RevealWordsProps {
  children: string;
}

export function RevealWords({ children }: RevealWordsProps) {
  let wordIndex = 0;

  return children.split(/(\s+)/).map((part, partIndex) => {
    if (/^\s+$/.test(part)) return part;

    const style = { "--word-index": wordIndex++ } as CSSProperties;
    return (
      <span className="title-word" style={style} key={`${part}-${partIndex}`}>
        {part}
      </span>
    );
  });
}
