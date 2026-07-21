export default function RoadAidLogo({ className = "logo" }) {
  return (
    <div className={className} role="img" aria-label="RoadAid roadside assistance logo">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path className="roadAidRoad" d="M8 37c7-8 13-10 22-10 4 0 7 1 10 3" />
        <path
          className="roadAidCar"
          d="M12 29.5h24.5c1.4 0 2.5 1.1 2.5 2.5v4.5H9.5V32c0-1.4 1.1-2.5 2.5-2.5Z"
        />
        <path className="roadAidCar" d="m17 29.5 3-6h12l3.5 6" />
        <circle className="roadAidWheel" cx="16" cy="36.5" r="2.5" />
        <circle className="roadAidWheel" cx="33" cy="36.5" r="2.5" />
        <path className="roadAidBeacon" d="M24 12.5a4 4 0 0 1 4 4v2h-8v-2a4 4 0 0 1 4-4Z" />
        <path className="roadAidRay" d="M24 8.5v-2M17.5 14l-2-1.2M30.5 14l2-1.2" />
      </svg>
    </div>
  );
}
