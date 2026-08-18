export interface IconInterface {
  /** Rendered width and height in px; matches the `fontSize` MUI was given. */
  size?: number;
  className?: string;
  /**
   * Only for an icon that is the sole content of a control with no other label.
   * Supplying it turns the SVG into an `img` with an accessible name; leaving it
   * off keeps the icon out of the accessibility tree, which is what you want
   * whenever the surrounding control already says what it does.
   */
  title?: string;
}
