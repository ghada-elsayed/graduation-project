// src/components/SpiderChart.jsx
import { useEffect, useRef } from "react";

export default function SpiderChart({ spiderJson }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!spiderJson || !ref.current) return;

    // load plotly lazily
    import("plotly.js-dist-min").then(Plotly => {
      const figure = JSON.parse(spiderJson);
      Plotly.newPlot(ref.current, figure.data, figure.layout, {
        responsive:     true,
        displayModeBar: false,
      });
    });

    return () => {
      import("plotly.js-dist-min").then(Plotly => {
        if (ref.current) Plotly.purge(ref.current);
      });
    };
  }, [spiderJson]);

  if (!spiderJson) return null;

  return (
    <div style={{
      marginTop: 12,
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid #e2eaf2",
      width: "90vw",        
      maxWidth: "900px",
    }}>
      <div ref={ref} style={{ width: "100%", height: 650 }} />
    </div>
  );
}