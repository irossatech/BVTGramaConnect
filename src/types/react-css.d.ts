// Inline styles may set CSS custom properties (style={{"--d": "90ms"}}), as the ported templates do.
import "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
