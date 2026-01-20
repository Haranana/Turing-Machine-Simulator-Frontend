

type SaveLoadShareIconProps = {
  color?: string;

  size?: number;

  className?: string;

  title?: string;
};

export function SaveLoadShareIcon({
  color = "currentColor",
  size = 203,
  className,
  title = "Save, load and share",
}: SaveLoadShareIconProps) {
  const height = Math.round((size * 193) / 203);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={height}
      viewBox="0 0 203 193"
      className={className}
      style={{
        color,
        background: "transparent",
      }}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      <ellipse
        cx="161"
        cy="121"
        rx="40"
        ry="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <ellipse
        cx="71"
        cy="41"
        rx="40"
        ry="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <ellipse
        cx="41"
        cy="151"
        rx="40"
        ry="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="3 3 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        x="46"
        y="16"
      >
        <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="42.78"
        height="55"
        viewBox="5 3 14 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        x="19.61"
        y="123.5"
      >
        <path d="M12 17V3" />
        <path d="m6 11 6 6 6-6" />
        <path d="M19 21H5" />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="2.25 2.25 19.5 19.5"
        fill="none"
        x="136"
        y="96"
      >
        <path
          d="M8.68439 10.6578L15.3124 7.34378M15.3156 16.6578L8.69379 13.3469M21 6C21 7.65685 19.6569 9 18 9C16.3431 9 15 7.65685 15 6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </svg>
  );
}