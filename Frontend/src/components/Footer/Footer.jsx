import "./Footer.css";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-item">
            <div className="logo">
              <img src={logo} alt="logo" />
            </div>
            <div className="phone">
              <span>Gọi ngay: </span>
              <span className="phone-number">0969999999</span>
            </div>
            <div className="address">
              Ngõ 216, Lê Thanh Nghị, Hai Bà Trưng, Hà Nội
            </div>
          </div>

          <div className="footer-item">
            <div className="title">Bạn muốn làm gì</div>
            <div className="item">Gia sư</div>
            <div className="item">Lập trình</div>
            <div className="item">Ma quỷ</div>
          </div>

          <div className="footer-item">
            <div className="title">Công việc</div>
            <div className="item">Free-Lancers</div>
            <div className="item">Full-Times</div>
            <div className="item">Part-Times</div>
          </div>

          <div className="footer-item">
            <div className="title">Người phát triển</div>
            <div className="item">Mai Văn Đăng</div>
            <div className="item">Vũ Quyền Gia Linh</div>
            <div className="item">Phạm Hoàng Minh Châu</div>
            <div className="item">Nguyễn Đức Trường</div>
            <div className="item">Vũ Ngọc Lâm</div>
            <div className="item">Nguyễn Sĩ Anh Đức</div>
          </div>
        </div>

        <div className="footer-bottom">@2026 made by バサウチーム</div>
      </div>
    </div>
  );
};

export default Footer;
