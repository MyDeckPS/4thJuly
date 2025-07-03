
import Avatar from "boring-avatars";

interface BoringAvatarProps {
  name: string;
  size: number;
  variant?: "marble" | "beam" | "pixel" | "sunset" | "ring" | "bauhaus";
}

const BoringAvatar = ({ name, size, variant = "beam" }: BoringAvatarProps) => {
  return (
    <div style={{ borderRadius: '50%', overflow: 'hidden', width: size, height: size }}>
      <Avatar
        size={size}
        name={name}
        variant={variant}
        colors={["#A3A948", "#EDB92E", "#F75C03", "#D90368", "#04A777"]}
      />
    </div>
  );
};

export default BoringAvatar;
