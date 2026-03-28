import React from 'react';
import { Layout, Menu, Button, Typography, Row, Col, Card, Space, Tag, Avatar, Divider } from 'antd';
import { 
  BankFilled, CheckCircleOutlined, ArrowRightOutlined, ArrowLeftOutlined, 
  StarOutlined, FireOutlined, CoffeeOutlined, TrophyOutlined, HeartOutlined, 
  TeamOutlined, CarOutlined, CustomerServiceOutlined, 
  EnvironmentOutlined, ClockCircleOutlined, 
  FacebookFilled, InstagramFilled, TwitterOutlined, YoutubeFilled, 
  PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

// Bảng màu chuẩn của Grand Hotel
const COLORS = {
  gold: "#c19b4a",
  lightGold: "#fdf8ef",
  dark: "#1a1a1a",
  gray: "#8c8c8c",
  bg: "#fff",
  textOnDark: "#e0e0e0"
};

const HomePage = () => {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  // Cấu hình menu theo chuẩn Ant Design mới nhất (dùng items thay vì Menu.Item)
  const menuItems = [
    { key: '1', label: 'Trang chủ' },
    { key: '2', label: 'Phòng' },
    { key: '3', label: 'Dịch vụ' },
    { key: '4', label: 'Đặt phòng' },
    { key: '5', label: 'Blog' }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Open Sans', sans-serif" }}>
      
      {/* 1. HEADER */}
      <Header style={{ 
        background: "#fff", display: "flex", justifyContent: "space-between", 
        alignItems: "center", padding: isMobile ? "0 20px" : "0 80px", height: "100px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 1000,
        width: "100%"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 50, height: 50, background: COLORS.gold, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
            <BankFilled style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: COLORS.dark, letterSpacing: '1px' }}>GRAND HOTEL</Title>
        </div>
        
        <Menu 
          mode="horizontal" 
          defaultSelectedKeys={['1']} 
          items={menuItems} // Đã sửa lỗi Menu
          style={{ border: 'none', flex: 1, justifyContent: 'center', color: COLORS.gray, fontWeight: 500, fontSize: 16 }} 
        />

        <Button 
          type="primary" 
          onClick={() => navigate('/login')} 
          style={{ background: COLORS.gold, borderColor: COLORS.gold, height: 45, borderRadius: 8, fontWeight: 'bold', fontSize: 16 }}
        >
          ĐĂNG NHẬP
        </Button>
      </Header>

      <Content style={{ padding: isMobile ? "0 20px" : "0 80px" }}>
        
        {/* 2. HERO SECTION */}
        <div style={{ 
          position: "relative",
          // Đã fix lỗi 404 bằng link ảnh thật
          backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14d8373?q=80&w=2000&auto=format&fit=crop')", 
          backgroundColor: '#1a1a1a',
          backgroundSize: 'cover', backgroundPosition: 'center', height: "800px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          marginTop: -100, borderRadius: "0 0 40px 40px", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }}></div>
          
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff", padding: "0 20px" }}>
            <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "2px", fontWeight: "bold" }}>—— 5-STAR LUXURY RESORT & SPA ——</Text>
            <Title level={1} style={{ color: '#fff', margin: "15px 0", fontSize: isMobile ? 40 : 80, fontWeight: 700, fontFamily: "'Noto Serif', serif" }}>
              Nơi Sang Trọng Gặp Gỡ Bình Yên
            </Title>
            <Paragraph style={{ color: '#e0e0e0', fontSize: 20, maxWidth: 600, margin: "0 auto 40px auto" }}>
              Trải nghiệm nghỉ dưỡng đẳng cấp thế giới giữa lòng Đà Nẵng xinh đẹp
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" style={{ background: COLORS.gold, borderColor: COLORS.gold, height: 60, borderRadius: 8, fontWeight: 'bold', fontSize: 18, padding: "0 30px" }}>
                KHÁM PHÁ PHÒNG
              </Button>
              <Button size="large" ghost style={{ color: "#fff", borderColor: "#fff", height: 60, borderRadius: 8, fontWeight: 'bold', fontSize: 18, padding: "0 30px" }}>
                DỊCH VỤ CỦA CHÚNG TÔI
              </Button>
            </Space>
          </div>
          
          <div style={{ position: "absolute", bottom: 0, left: "5%", right: "5%", padding: isMobile ? "20px" : "30px 60px", color: COLORS.dark, backgroundColor: COLORS.lightGold, display: "flex", justifyContent: "space-between", flexWrap: "wrap", zIndex: 2, borderRadius: "20px 20px 0 0", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
            {[
              { icon: <CheckCircleOutlined />, title: "4.9★", desc: "Đánh giá trung bình" },
              { icon: <CheckCircleOutlined />, title: "2,400+", desc: "Lượt đánh giá" },
              { icon: <CheckCircleOutlined />, title: "30+", desc: "Năm kinh nghiệm" },
              { icon: <CheckCircleOutlined />, title: "150+", desc: "Căn phòng cao cấp" }
            ].map(item => (
              <div key={item.desc} style={{ display: 'flex', alignItems: 'center', margin: "10px 0" }}>
                <Avatar size={48} icon={item.icon} style={{ background: COLORS.lightGold, color: COLORS.gold, border: `2px solid ${COLORS.gold}`, marginRight: 15 }} />
                <div>
                  <Title level={4} style={{ margin: 0, color: COLORS.dark }}>{item.title}</Title>
                  <Text style={{ color: COLORS.gray }}>{item.desc}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ROOM COLLECTION */}
        <div style={{ padding: "100px 0", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>—— BỘ SƯU TẬP ——</Text>
            <Title level={2} style={{ margin: "15px 0", fontSize: isMobile ? 32 : 56, color: COLORS.dark, fontFamily: "'Noto Serif', serif" }}>
              Không Gian Nghỉ Dưỡng Đẳng Cấp
            </Title>
          </div>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card hoverable cover={<img alt="Room" src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop" style={{ height: 500, objectFit: "cover" }} />} style={{ borderRadius: 16, overflow: 'hidden', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <Text strong style={{ color: COLORS.gold }}>35M² • 2 KHÁCH</Text>
                        <Title level={3} style={{ color: COLORS.dark, margin: "10px 0", fontFamily: "'Noto Serif', serif" }}>Phòng Deluxe Giường Đôi</Title>
                        <Paragraph style={{ color: COLORS.gray, fontSize: 16 }}>Phòng sang trọng với thiết kế hiện đại, view thành phố tuyệt đẹp.</Paragraph>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 20 }}>
                        <Tag color="gold" style={{ borderRadius: 20, marginBottom: 5 }}>-17%</Tag>
                        <Text delete style={{ color: COLORS.gray, display: 'block' }}>5.500.000đ</Text>
                        <Title level={4} style={{ color: COLORS.dark, margin: 0 }}>4.500.000đ<span style={{fontSize: 14, color: COLORS.gray, fontWeight: 'normal'}}>/đêm</span></Title>
                        <Button type="link" style={{ color: COLORS.gold, padding: "10px 0", fontWeight: 'bold' }}>XEM NGAY <ArrowRightOutlined /></Button>
                    </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              {/* Đã sửa lỗi Space bằng thẻ div linh hoạt */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: "100%", height: '100%', justifyContent: 'space-between' }}>
                {[
                  { image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop", name: "Phòng Suite Cao Cấp", area: "65M²", guest: "4 KHÁCH", price: "3.500.000đ" },
                  { image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop", name: "Phòng Ocean View", area: "40M²", guest: "2 KHÁCH", price: "2.200.000đ" }
                ].map((room, index) => (
                  <Card key={index} hoverable styles={{ body: { padding: 15 } }} style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <Row align="middle" gutter={20}>
                      <Col span={10}>
                        <img alt="Room" src={room.image} style={{ width: '100%', height: 200, borderRadius: 12, objectFit: "cover" }} />
                      </Col>
                      <Col span={14} style={{ position: 'relative' }}>
                        <Tag color="gold" style={{ borderRadius: 20, position: 'absolute', top: 0, right: 0 }}>HOT</Tag>
                        <Text strong style={{ color: COLORS.gold }}>{room.area} • {room.guest}</Text>
                        <Title level={4} style={{ color: COLORS.dark, margin: "10px 0", fontFamily: "'Noto Serif', serif" }}>{room.name}</Title>
                        <Title level={4} style={{ color: COLORS.dark, margin: 0 }}>{room.price}<span style={{fontSize: 14, color: COLORS.gray, fontWeight: 'normal'}}>/đêm</span></Title>
                        <Button type="link" style={{ color: COLORS.gold, padding: "10px 0", fontWeight: 'bold' }}>XEM NGAY <ArrowRightOutlined /></Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
          
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <Button size="large" style={{ color: COLORS.gold, borderColor: COLORS.gold, background: "transparent", height: 60, borderRadius: 8, fontWeight: 'bold', fontSize: 18, padding: "0 40px" }}>
              XEM TẤT CẢ PHÒNG <ArrowRightOutlined />
            </Button>
          </div>
        </div>

        {/* 4. SERVICES GRID */}
        <div style={{ padding: "100px 0", background: "#fcfaf5", borderRadius: 40, margin: "0 -80px", paddingInline: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>—— TIỆN ÍCH ——</Text>
            <Title level={2} style={{ margin: "15px 0", fontSize: isMobile ? 32 : 56, color: COLORS.dark, fontFamily: "'Noto Serif', serif" }}>
              Dịch Vụ & Tiện Nghi Đẳng Cấp
            </Title>
            <Paragraph style={{ color: COLORS.gray, fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
              Trải nghiệm dịch vụ 5 sao với đầy đủ tiện nghi hiện đại
            </Paragraph>
          </div>

          <Row gutter={[30, 30]}>
            {[
              { icon: <StarOutlined />, name: "Hồ Bơi Vô Cực", desc: "View biển tuyệt đẹp" },
              { icon: <FireOutlined />, name: "Spa & Massage", desc: "Thư giãn toàn diện" },
              { icon: <CoffeeOutlined />, name: "Nhà Hàng 5 Sao", desc: "Ẩm thực đa quốc gia" },
              { icon: <TrophyOutlined />, name: "Phòng Gym", desc: "Trang thiết bị hiện đại" },
              { icon: <HeartOutlined />, name: "Bar & Lounge", desc: "Cocktail cao cấp" },
              { icon: <TeamOutlined />, name: "Hội Nghị", desc: "Phòng họp chuyên nghiệp" },
              { icon: <CarOutlined />, name: "Đưa Đón Sân Bay", desc: "Dịch vụ miễn phí" },
              { icon: <CustomerServiceOutlined />, name: "Butler 24/7", desc: "Phục vụ tận tình" }
            ].map(service => (
              <Col key={service.name} xs={12} md={6}>
                {/* Đã sửa lỗi variant */}
                <Card hoverable variant="borderless" style={{ borderRadius: 16, textAlign: 'center', background: 'transparent' }}>
                  <div style={{ width: 70, height: 70, border: `1px solid ${COLORS.gold}`, borderRadius: "50%", display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto' }}>
                    {React.cloneElement(service.icon, { style: { color: COLORS.gold, fontSize: 28 } })}
                  </div>
                  <Title level={4} style={{ color: COLORS.dark, margin: "5px 0", fontFamily: "'Noto Serif', serif" }}>{service.name}</Title>
                  <Paragraph style={{ color: COLORS.gray }}>{service.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 5. NEARBY DESTINATIONS */}
        <div style={{ padding: "100px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60 }}>
            <div>
              <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>—— KHÁM PHÁ ——</Text>
              <Title level={2} style={{ margin: "15px 0 0 0", fontSize: isMobile ? 32 : 56, color: COLORS.dark, fontFamily: "'Noto Serif', serif" }}>
                Điểm Đến Xung Quanh
              </Title>
            </div>
            <div className="destination-nav" style={{ display: 'flex', gap: 15 }}>
              <Button size="large" className="prev-btn" style={{ borderColor: COLORS.gray, color: COLORS.gray, height: 50, width: 50, borderRadius: '50%' }} icon={<ArrowLeftOutlined />} />
              <Button size="large" className="next-btn" style={{ borderColor: COLORS.gold, color: COLORS.gold, height: 50, width: 50, borderRadius: '50%' }} icon={<ArrowRightOutlined />} />
            </div>
          </div>
          
          <Swiper
            modules={[Navigation]}
            spaceBetween={30}
            slidesPerView={isMobile ? 1 : 3}
            navigation={{ prevEl: '.destination-nav .prev-btn', nextEl: '.destination-nav .next-btn' }}
          >
            {[
              { image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop", distance: "25 KM", name: "Bà Nà Hills", desc: "Khu du lịch nổi tiếng với Cầu Vàng" },
              { image: "https://images.unsplash.com/photo-1583417267846-e58bf43e80b2?q=80&w=1000&auto=format&fit=crop", distance: "3 KM", name: "Cầu Rồng", desc: "Biểu tượng của thành phố Đà Nẵng" },
              { image: "https://images.unsplash.com/photo-1596395825390-e55500e57ba5?q=80&w=1000&auto=format&fit=crop", distance: "5 KM", name: "Bãi Biển Mỹ Khê", desc: "Một trong những bãi biển đẹp nhất thế giới" }
            ].map((dest, index) => (
              <SwiperSlide key={index}>
                <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 450 }}>
                  <img alt={dest.name} src={dest.image} style={{ width: '100%', height: '100%', objectFit: "cover" }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}></div>
                  <div style={{ position: 'absolute', bottom: 30, left: 30, right: 30, color: '#fff' }}>
                    <Tag color="gold" style={{ borderRadius: 20, marginBottom: 10, border: 'none' }}><EnvironmentOutlined /> {dest.distance}</Tag>
                    <Title level={3} style={{ color: '#fff', margin: "0 0 10px 0", fontFamily: "'Noto Serif', serif" }}>{dest.name}</Title>
                    <Text style={{ color: '#e0e0e0' }}>{dest.desc}</Text>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </Content>

      {/* 6. FOOTER */}
      <Footer style={{ background: COLORS.dark, color: COLORS.textOnDark, padding: isMobile ? "40px 20px" : "80px" }}>
        <Row gutter={[40, 40]}>
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, background: COLORS.gold, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                <BankFilled style={{ color: '#fff', fontSize: 20 }} />
              </div>
              <Title level={3} style={{ margin: 0, color: '#fff', letterSpacing: '1px' }}>GRAND HOTEL</Title>
            </div>
            <Paragraph style={{ color: COLORS.gray, margin: "15px 0", maxWidth: 300 }}>Biểu tượng của sự sang trọng và tinh tế tại Đà Nẵng. Nơi mỗi khoảnh khắc đều trở thành kỷ niệm.</Paragraph>
            <Space size="middle" style={{ marginTop: 20 }}>
              <Button shape="circle" icon={<FacebookFilled />} style={{ background: 'transparent', color: COLORS.gray, borderColor: COLORS.gray }} />
              <Button shape="circle" icon={<InstagramFilled />} style={{ background: 'transparent', color: COLORS.gray, borderColor: COLORS.gray }} />
              <Button shape="circle" icon={<TwitterOutlined />} style={{ background: 'transparent', color: COLORS.gray, borderColor: COLORS.gray }} />
            </Space>
          </Col>
          <Col xs={12} md={5}>
            <Title level={5} style={{ color: '#fff', marginBottom: 20, letterSpacing: '2px' }}>KHÁM PHÁ</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Trang Chủ</Text>
              <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Đặt Phòng</Text>
              <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Phòng & Suite</Text>
              <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Tin Tức</Text>
            </div>
          </Col>
          <Col xs={12} md={5}>
            <Title level={5} style={{ color: '#fff', marginBottom: 20, letterSpacing: '2px' }}>DỊCH VỤ</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Spa & Massage</Text>
              <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Nhà Hàng Fine Dining</Text>
              <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Hội Nghị & Sự Kiện</Text>
              <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Đưa Đón Sân Bay</Text>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} style={{ color: '#fff', marginBottom: 20, letterSpacing: '2px' }}>LIÊN HỆ</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Text style={{ color: COLORS.gray }}><EnvironmentOutlined style={{ color: COLORS.gold, marginRight: 10 }}/> 123 Đường Biển, Đà Nẵng</Text>
              <Text style={{ color: COLORS.gray }}><PhoneOutlined style={{ color: COLORS.gold, marginRight: 10 }}/> +84 236 123 4567</Text>
              <Text style={{ color: COLORS.gray }}><MailOutlined style={{ color: COLORS.gold, marginRight: 10 }}/> info@grandhotel.vn</Text>
            </div>
          </Col>
        </Row>
        
        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '40px 0 20px 0' }} />
        <Row justify="space-between" style={{ color: COLORS.gray, fontSize: 13 }}>
            <Col>© 2026 Grand Hotel Da Nang. All rights reserved.</Col>
            <Col>
              {/* Đã sửa lỗi Space split thành separator */}
              <Space separator={<span style={{color: COLORS.gray}}>|</span>}>
                <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Chính sách bảo mật</Text>
                <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Điều khoản dịch vụ</Text>
              </Space>
            </Col>
        </Row>
      </Footer>
    </Layout>
  );
};

export default HomePage;