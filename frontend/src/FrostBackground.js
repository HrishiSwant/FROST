import Spline from "@splinetool/react-spline";

export default function FrostBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -2 }}>
      <Spline scene="https://prod.spline.design/UemxkLFlofec3ccZ/scene.splinecode" />
    </div>
  );
}
