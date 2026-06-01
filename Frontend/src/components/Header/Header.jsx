import "./Header.css";
import logo from "../../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="header">
      <div className="header-left">
        <img className="logo" src={logo} alt="logo" />
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "header-item active" : "header-item"
          }
        >
          Trang chủ
        </NavLink>
        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            isActive ? "header-item active" : "header-item"
          }
        >
          Tìm việc
        </NavLink>
        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "header-item active" : "header-item"
            }
          >
            Thông tin cá nhân
          </NavLink>
        )}
      </div>
      <div className="header-right">
        {user ? (
          <div className="header-user">
            {user.avatar && (
              <img className="header-avatar" src={user.avatar} alt="avatar" />
            )}
            <span className="header-name">{user.name}</span>
            <button className="header-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="header-login">
            Đăng nhập
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Header;
