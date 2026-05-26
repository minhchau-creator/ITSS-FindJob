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
            <div className="item">Lưu Việt Hoàn</div>
            <div className="item">Hà Đình Nam</div>
            <div className="item">Vũ Minh Quân</div>
            <div className="item">Vũ Thị Quỳnh Như</div>
            <div className="item">Nguyễn Quốc Khánh</div>
            <div className="item">Phạm Hoàng Hải Nam</div>
            <div className="item">Phạm Nhật Anh</div>
          </div>
        </div>

        <div className="footer-bottom">@2025 Tạo bởi nhóm Sora_ITSS2</div>
      </div>
    </div>
  );
};

export default Footer;
