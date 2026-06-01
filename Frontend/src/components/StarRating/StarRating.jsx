import { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import "./StarRating.css";

/**
 * Props:
 *  - value: number (0-5)
 *  - onChange: (v) => void  → nếu truyền vào, component thành interactive
 *  - size: "small" | "medium" | "large"
 *  - allowHalf: hiển thị nửa sao (chỉ áp dụng read-only)
 */
const StarRating = ({
  value = 0,
  onChange,
  size = "medium",
  allowHalf = true,
}) => {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === "function";
  const display = interactive ? hover || value : value;

  const sizePx = size === "small" ? 18 : size === "large" ? 32 : 22;

  const handleClick = (v) => interactive && onChange(v);

  return (
    <div
      className={`star-rating ${interactive ? "interactive" : "readonly"}`}
      onMouseLeave={() => interactive && setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = display >= i;
        const half = !filled && allowHalf && display >= i - 0.5;

        const Icon = filled ? StarIcon : half ? StarHalfIcon : StarBorderIcon;

        return (
          <Icon
            key={i}
            style={{ fontSize: sizePx, color: "#f59e0b", cursor: interactive ? "pointer" : "default" }}
            onClick={() => handleClick(i)}
            onMouseEnter={() => interactive && setHover(i)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
