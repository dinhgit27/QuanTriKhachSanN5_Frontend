import React, { useRef, useState } from 'react';
import { Layout, Button, Typography, Row, Col, Space, Tag, Avatar, Divider, Dropdown } from 'antd';
import { 
  ArrowRightOutlined, ArrowLeftOutlined, EnvironmentOutlined, 
  FacebookFilled, InstagramFilled, TwitterOutlined,
  PhoneOutlined, MailOutlined, UserOutlined, LogoutOutlined
} from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
// IMPORT MODULE
import { Navigation, Autoplay, Mousewheel, Pagination } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const { Header } = Layout;
const { Title, Text, Paragraph } = Typography;

const COLORS = {
  gold: "#c19b4a",
  dark: "#0a0a0a",
  gray: "#b3b3b3",
  bg: "#fff"
};

// ==========================================
// DỮ LIỆU BỘ SƯU TẬP PHÒNG (ROOMS DATA)
// ==========================================
const ROOM_DATA = [
  {
    id: "01", total: "03",
    name: "Phòng Deluxe Giường Đôi",
    area: "35m²", guests: "2 khách",
    desc: "Phòng sang trọng với thiết kế hiện đại, view trực diện biển đón bình minh mỗi sớm mai.",
    amenities: ["Wifi miễn phí", "TV 50 inch", "Minibar"],
    oldPrice: "1.800.000đ", newPrice: "1.500.000đ",
    img: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "02", total: "03",
    name: "Phòng Suite Hoàng Gia",
    area: "65m²", guests: "4 khách",
    desc: "Không gian rộng rãi vương giả, tích hợp phòng khách riêng và bồn tắm sục Jacuzzi.",
    amenities: ["Bồn tắm sục", "Phòng khách riêng", "Ban công lớn"],
    oldPrice: "3.500.000đ", newPrice: "2.800.000đ",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "03", total: "03",
    name: "Biệt Thự View Đại Dương",
    area: "120m²", guests: "6 khách",
    desc: "Trải nghiệm riêng tư tuyệt đối với hồ bơi cá nhân vô cực và dịch vụ quản gia 24/7.",
    amenities: ["Hồ bơi riêng", "Quản gia", "Sân BBQ"],
    oldPrice: "8.000.000đ", newPrice: "6.500.000đ",
    img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop"
  }
];

// ==========================================
// COMPONENT HIỆU ỨNG (ĐÃ TỐI ƯU BẰNG MEMO)
// ==========================================
const SunRays = React.memo(({ isActive }) => {
  if (!isActive) return null; // Hủy render khi không ở trang đầu để tiết kiệm GPU
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      <motion.div 
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.2, 1] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute', top: '-15%', left: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(255,250,220,0.9) 0%, rgba(255,230,150,0.3) 40%, transparent 70%)',
          filter: 'blur(40px)', mixBlendMode: 'screen'
        }} 
      />
    </div>
  );
});

const BlingBling = React.memo(({ isActive }) => {
  if (!isActive) return null; // Hủy render khi cuộn qua trang khác
  const particles = Array.from({ length: 30 }).map((_, i) => ({ // Giảm từ 45 xuống 30 hạt để mượt hơn
    id: i,
    size: Math.random() * 4 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 5 + 4,
    delay: Math.random() * 3,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: -120, x: -80, scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute', left: p.left, top: p.top, width: p.size, height: p.size,
            backgroundColor: '#fff', borderRadius: '50%',
            boxShadow: '0 0 10px 2px rgba(255, 220, 100, 0.6), 0 0 20px 4px rgba(255, 255, 255, 0.4)'
          }}
        />
      ))}
    </div>
  );
});

// ==========================================
// TRANG CHỦ CHÍNH
// ==========================================
const HomePage = () => {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScene, setActiveScene] = useState(0); // Index từ 0 đến 4
  const [mainSwiper, setMainSwiper] = useState(null); // Ref để điều khiển Swiper dọc

  // --- MENU ĐIỀU HƯỚNG ---
  const menuItems = [
    { key: 0, label: 'Trang chủ' },
    { key: 1, label: 'Bộ sưu tập' },
    { key: 2, label: 'Tiện ích' },
    { key: 3, label: 'Khám phá' },
    { key: 4, label: 'Liên hệ' },
  ];

  const scrollToScene = (index) => {
    if (mainSwiper) mainSwiper.slideTo(index);
  };

  const userMenuItems = [
    { key: 'profile', label: 'Hồ sơ của tôi', icon: <UserOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: () => setIsLoggedIn(false) }
  ];

  // --- ANIMATION CHỮ ĐẨY LÊN ---
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const pushUpVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
  };

  // Animation nền zoom nhẹ khi vừa chuyển tới màn hình
  const bgScaleVariant = {
    hidden: { scale: 1.1 },
    visible: { scale: 1, transition: { duration: 1.5, ease: "easeOut" } }
  };

  const reviews = [
    "Trải nghiệm tuyệt vời nhất tôi từng có! - 🌟🌟🌟🌟🌟",
    "Kiến trúc đẳng cấp, dịch vụ hoàn hảo. - 🌟🌟🌟🌟🌟",
    "Kỳ nghỉ dưỡng trong mơ tại Đà Nẵng. - 🌟🌟🌟🌟🌟",
    "Nhân viên cực kỳ chuyên nghiệp. - 🌟🌟🌟🌟🌟"
  ];

  const glassStyle = {
    background: "rgba(10, 10, 10, 0.7)", backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.1)", 
    borderRadius: "24px", padding: isMobile ? "20px" : "40px"
  };

  return (
    <div style={{ height: "100vh", width: "100vw", background: COLORS.dark, fontFamily: "'Open Sans', sans-serif", overflow: "hidden" }}>
      
      {/* ========================================= */}
      {/* HEADER (Sticky nằm đè lên Swiper) */}
      {/* ========================================= */}
      <Header style={{ 
        background: "rgba(0, 0, 0, 0.4)", display: "flex", justifyContent: "space-between", 
        alignItems: "center", padding: isMobile ? "0 20px" : "0 80px", height: "80px",
        position: "absolute", top: 0, zIndex: 1000, width: "100%", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ cursor: 'pointer' }} onClick={() => scrollToScene(0)}>
          <Title level={4} style={{ margin: 0, color: '#fff', letterSpacing: '2px', fontFamily: "'Noto Serif', serif" }}>GRAND</Title>
        </div>
        
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', gap: isMobile ? '15px' : '40px' }}>
          {menuItems.map((item) => (
            <Text 
              key={item.key} 
              onClick={() => scrollToScene(item.key)}
              style={{ 
                color: activeScene === item.key ? COLORS.gold : '#fff',
                cursor: 'pointer', fontWeight: 500, fontSize: 15, transition: "color 0.3s" 
              }} 
              onMouseEnter={(e) => e.target.style.color = COLORS.gold}
              onMouseLeave={(e) => e.target.style.color = activeScene === item.key ? COLORS.gold : '#fff'}
            >
              {item.label}
            </Text>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer', padding: '5px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }}>
                  <Avatar src="https://i.pravatar.cc/150?img=11" />
                  {!isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <Text strong style={{ fontSize: 13, color: '#fff' }}>Nguyễn Văn Khách</Text>
                        <Text style={{ fontSize: 11, color: COLORS.gray }}>GUEST</Text>
                    </div>
                  )}
              </div>
            </Dropdown>
          ) : (
          <Button 
            type="primary" 
            onClick={() => navigate('/login')} 
            style={{ background: COLORS.gold, borderColor: COLORS.gold, fontWeight: 'bold', borderRadius: 20 }}
          >
            ĐĂNG NHẬP
          </Button>
        )}
        </div>
      </Header>

      {/* ========================================= */}
      {/* MAIN LAYOUT: VERTICAL SWIPER (Tạo hiệu ứng cuộn từng trang) */}
      {/* ========================================= */}
      <Swiper
        direction={"vertical"}
        mousewheel={{ forceToAxis: true, sensitivity: 1 }} // Điều khiển cuộn chuột mượt
        speed={1000} // Tốc độ chuyển trang
        onSwiper={setMainSwiper}
        onSlideChange={(swiper) => setActiveScene(swiper.activeIndex)}
        modules={[Mousewheel]}
        style={{ width: "100%", height: "100%" }}
      >
        
        {/* === SCENE 1: HERO === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <motion.div 
              variants={bgScaleVariant} initial="hidden" animate={activeScene === 0 ? "visible" : "hidden"}
              style={{
                position: "absolute", inset: 0,
                backgroundImage: "url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000&auto=format&fit=crop')",
                backgroundSize: 'cover', backgroundPosition: 'center'
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.8) 100%)" }}></div>
            </motion.div>
            
            {/* Chỉ render hiệu ứng nặng khi màn hình 1 đang active */}
            <SunRays isActive={activeScene === 0} />
            <BlingBling isActive={activeScene === 0} />
            
            <motion.div 
              variants={staggerContainer} initial="hidden" animate={activeScene === 0 ? "visible" : "hidden"}
              style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 20px" }}
            >
              <motion.div variants={pushUpVariant}>
                 <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "3px", fontWeight: "bold", marginBottom: 20 }}>LUXURY RESORT & SPA — ĐÀ NẴNG</Text>
              </motion.div>
              <motion.div variants={pushUpVariant}>
                  <Title level={1} style={{ color: '#fff', fontSize: isMobile ? 40 : 80, fontWeight: 400, fontFamily: "'Noto Serif', serif", maxWidth: 900, lineHeight: 1.2 }}>
                  Trải Nghiệm Nghỉ Dưỡng<br/>Đẳng Cấp Thế Giới
                  </Title>
              </motion.div>
              <motion.div variants={pushUpVariant}>
                  <Paragraph style={{ color: '#e0e0e0', fontSize: 18, maxWidth: 600, marginTop: 20 }}>Nơi kiến trúc tinh tế gặp gỡ dịch vụ hoàn hảo. Mỗi khoảnh khắc tại Grand Hotel đều mang đến sự bình yên.</Paragraph>
              </motion.div>
              
              <motion.div variants={pushUpVariant} style={{ width: "100%", maxWidth: 800 }}>
                  <div style={{ marginTop: 30, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><Text style={{color: COLORS.gray, display: 'block', fontSize: 12}}>NHẬN PHÒNG</Text><Text strong style={{color: '#fff'}}>mm/dd/yyyy 🗓</Text></div>
                  <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }}></div>
                  <div><Text style={{color: COLORS.gray, display: 'block', fontSize: 12}}>TRẢ PHÒNG</Text><Text strong style={{color: '#fff'}}>mm/dd/yyyy 🗓</Text></div>
                  <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }}></div>
                  <div><Text style={{color: COLORS.gray, display: 'block', fontSize: 12}}>KHÁCH</Text><Text strong style={{color: '#fff'}}>2 khách</Text></div>
                  <Button shape="circle" size="large" style={{ background: '#fff', border: 'none' }} icon={<ArrowRightOutlined />} />
                  </div>
              </motion.div>

              <motion.div variants={pushUpVariant} style={{ position: "absolute", bottom: 60 }}>
                  <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: COLORS.gold, fontSize: 24, cursor: 'pointer' }} onClick={() => scrollToScene(1)}>↓</motion.div>
              </motion.div>
            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 2: BỘ SƯU TẬP PHÒNG === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", alignItems: "center" }}>
            <motion.div 
              variants={bgScaleVariant} initial="hidden" animate={activeScene === 1 ? "visible" : "hidden"}
              style={{
                position: "absolute", inset: 0,
                backgroundImage: "url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2000&auto=format&fit=crop')",
                backgroundSize: 'cover', backgroundPosition: 'center'
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}></div>
            </motion.div>

            <motion.div 
              variants={staggerContainer} initial="hidden" animate={activeScene === 1 ? "visible" : "hidden"}
              style={{ position: "relative", width: "100%", padding: isMobile ? "80px 20px 20px" : "80px 80px 20px" }}
            >
              <motion.div variants={pushUpVariant} style={{ textAlign: "center", marginBottom: 30 }}>
                  <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "2px" }}>BỘ SƯU TẬP</Text>
                  <Title level={2} style={{ margin: "10px 0", fontSize: isMobile ? 32 : 48, color: '#fff', fontFamily: "'Noto Serif', serif" }}>Không Gian Nghỉ Dưỡng</Title>
              </motion.div>
              
              <motion.div variants={pushUpVariant}>
                {/* LƯU Ý: Đã bỏ Mousewheel ở đây để tránh dính scroll dọc của toàn trang */}
                <Swiper
                  modules={[Autoplay, Pagination]}
                  spaceBetween={50}
                  slidesPerView={1}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  style={{ width: '100%', paddingBottom: '50px', '--swiper-pagination-color': COLORS.gold, '--swiper-pagination-bullet-inactive-color': COLORS.gray }}
                >
                  {ROOM_DATA.map((room) => (
                    <SwiperSlide key={room.id}>
                      <div style={glassStyle}>
                        <Row gutter={[40, 40]} align="middle">
                            <Col xs={24} md={10}>
                                <Text style={{ color: COLORS.gray }}>{room.id} —— {room.total}</Text>
                                <Title level={2} style={{ fontFamily: "'Noto Serif', serif", marginTop: 10, color: '#fff' }}>{room.name}</Title>
                                <Space style={{ color: COLORS.gray, marginBottom: 20 }}><span>🛏 {room.area}</span><span>👤 {room.guests}</span></Space>
                                <Paragraph style={{ color: COLORS.gray, fontSize: 16 }}>{room.desc}</Paragraph>
                                
                                <Space size={[10, 10]} wrap style={{ marginBottom: 30 }}>
                                    {room.amenities.map(item => (
                                      <Tag key={item} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 15px' }}>{item}</Tag>
                                    ))}
                                </Space>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
                                    <div><Text delete style={{ color: COLORS.gray }}>{room.oldPrice}</Text><Title level={3} style={{ margin: 0, color: '#fff' }}>{room.newPrice}<span style={{fontSize: 14, color: COLORS.gray}}>/đêm</span></Title></div>
                                    <Button type="primary" size="large" style={{ background: COLORS.gold, border: "none" }}>ĐẶT NGAY</Button>
                                </div>
                            </Col>
                            <Col xs={24} md={14}>
                                <img src={room.img} alt={room.name} loading="lazy" style={{ width: '100%', height: isMobile ? "30vh" : "50vh", objectFit: 'cover', borderRadius: 16 }} />
                            </Col>
                        </Row>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </motion.div>
            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 3: DỊCH VỤ TIỆN ÍCH === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.div 
              variants={bgScaleVariant} initial="hidden" animate={activeScene === 2 ? "visible" : "hidden"}
              style={{
                position: "absolute", inset: 0,
                backgroundImage: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop')",
                backgroundSize: 'cover', backgroundPosition: 'center'
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }}></div>
            </motion.div>

            <motion.div 
              variants={staggerContainer} initial="hidden" animate={activeScene === 2 ? "visible" : "hidden"}
              style={{ position: "relative", padding: isMobile ? "80px 20px 20px" : "80px 80px 20px" }}
            >
              <motion.div variants={pushUpVariant} style={{ marginBottom: 40, textAlign: "center" }}>
                <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "2px" }}>TIỆN ÍCH</Text>
                <Title level={2} style={{ margin: "10px 0", fontSize: isMobile ? 32 : 48, color: '#fff', fontFamily: "'Noto Serif', serif" }}>Dịch Vụ Đẳng Cấp</Title>
              </motion.div>
              <Row gutter={[20, 20]}>
                {[
                  { img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800&auto=format&fit=crop", name: "Hồ Bơi Vô Cực", desc: "Tầm nhìn ra biển tuyệt đẹp" },
                  { img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop", name: "Spa & Wellness", desc: "Liệu trình chăm sóc toàn diện" },
                  { img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop", name: "Nhà Hàng 5 Sao", desc: "Ẩm thực đa quốc gia" },
                  { img: "https://images.unsplash.com/photo-1575037614876-c3852d4c5286?q=80&w=800&auto=format&fit=crop", name: "Bar & Lounge", desc: "Cocktail cao cấp" }
                ].map((service, index) => (
                  <Col key={index} xs={24} sm={12} md={6}>
                    <motion.div variants={pushUpVariant} style={{ ...glassStyle, padding: "20px", textAlign: "center" }}>
                        <img src={service.img} alt={service.name} loading="lazy" style={{ width: '100%', height: isMobile ? 150 : 250, objectFit: 'cover', borderRadius: 12, marginBottom: 15 }} />
                        <Title level={4} style={{ color: '#fff', fontFamily: "'Noto Serif', serif", margin: "0 0 5px 0" }}>{service.name}</Title>
                        <Text style={{ color: COLORS.gray }}>{service.desc}</Text>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 4: KHÁM PHÁ === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.div 
              variants={bgScaleVariant} initial="hidden" animate={activeScene === 3 ? "visible" : "hidden"}
              style={{
                position: "absolute", inset: 0,
                backgroundImage: "url('https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2000&auto=format&fit=crop')",
                backgroundSize: 'cover', backgroundPosition: 'center'
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)" }}></div>
            </motion.div>

            <motion.div 
              variants={staggerContainer} initial="hidden" animate={activeScene === 3 ? "visible" : "hidden"}
              style={{ position: "relative", padding: isMobile ? "80px 20px 20px" : "80px 80px 20px" }}
            >
              <motion.div variants={pushUpVariant} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
                  <div>
                    <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "2px" }}>KHÁM PHÁ</Text>
                    <Title level={2} style={{ margin: "10px 0 0 0", fontSize: isMobile ? 32 : 48, color: '#fff', fontFamily: "'Noto Serif', serif" }}>Điểm Đến Xung Quanh</Title>
                  </div>
                  <div className="destination-nav" style={{ display: 'flex', gap: 10 }}>
                      <Button ghost className="prev-btn" style={{ borderColor: COLORS.gray, color: '#fff' }} icon={<ArrowLeftOutlined />} />
                      <Button ghost className="next-btn" style={{ borderColor: COLORS.gold, color: COLORS.gold }} icon={<ArrowRightOutlined />} />
                  </div>
              </motion.div>
              
              <motion.div variants={pushUpVariant}>
                  {/* Tương tự, bỏ Mousewheel ở swiper con */}
                  <Swiper modules={[Navigation]} spaceBetween={30} slidesPerView={isMobile ? 1 : 3} navigation={{ prevEl: '.destination-nav .prev-btn', nextEl: '.destination-nav .next-btn' }}>
                      {[
                      { image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop", distance: "25 KM", name: "Bà Nà Hills", desc: "Khu du lịch nổi tiếng với Cầu Vàng" },
                      { image: "https://images.unsplash.com/photo-1583417267846-e58bf43e80b2?q=80&w=1000&auto=format&fit=crop", distance: "3 KM", name: "Cầu Rồng", desc: "Biểu tượng của thành phố Đà Nẵng" },
                      { image: "https://images.unsplash.com/photo-1596395825390-e55500e57ba5?q=80&w=1000&auto=format&fit=crop", distance: "5 KM", name: "Bãi Biển Mỹ Khê", desc: "Một trong những bãi biển đẹp nhất thế giới" }
                      ].map((dest, index) => (
                      <SwiperSlide key={index}>
                          <div style={{ position: 'relative', height: isMobile ? "40vh" : "55vh", borderRadius: 16, overflow: "hidden" }}>
                              <img alt={dest.name} src={dest.image} loading="lazy" style={{ width: '100%', height: '100%', objectFit: "cover" }} />
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }}></div>
                              <div style={{ position: 'absolute', bottom: 30, left: 30, right: 30, color: '#fff' }}>
                                  <Text style={{ color: COLORS.gold, fontSize: 12 }}><EnvironmentOutlined /> {dest.distance}</Text>
                                  <Title level={3} style={{ color: '#fff', margin: "5px 0", fontFamily: "'Noto Serif', serif" }}>{dest.name}</Title>
                                  <Text style={{ color: '#e0e0e0', fontSize: 13 }}>{dest.desc}</Text>
                              </div>
                          </div>
                      </SwiperSlide>
                      ))}
                  </Swiper>
              </motion.div>
            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 5: FOOTER === */}
        <SwiperSlide style={{ background: "#050505" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.div 
              variants={staggerContainer} initial="hidden" animate={activeScene === 4 ? "visible" : "hidden"}
              style={{ padding: isMobile ? "0 20px" : "0 80px" }}
            >
              <Row gutter={[40, 40]}>
                <Col xs={24} md={6}>
                  <motion.div variants={pushUpVariant}>
                      <Title level={4} style={{ margin: "0 0 20px 0", color: '#fff', letterSpacing: '2px', fontFamily: "'Noto Serif', serif" }}>GRAND HOTEL</Title>
                      <Paragraph style={{ color: COLORS.gray, fontSize: 13 }}>Khách sạn 5 sao tại Đà Nẵng, mang đến trải nghiệm nghỉ dưỡng đẳng cấp thế giới.</Paragraph>
                  </motion.div>
                </Col>
                <Col xs={12} md={{ span: 4, offset: 2 }}>
                  <motion.div variants={pushUpVariant}>
                      <Title level={5} style={{ color: COLORS.gray, fontSize: 12, marginBottom: 20, letterSpacing: '1px' }}>KHÁM PHÁ</Title>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <Text style={{ color: '#fff', cursor: 'pointer' }} onClick={() => scrollToScene(0)}>Trang chủ</Text>
                      <Text style={{ color: '#fff', cursor: 'pointer' }} onClick={() => scrollToScene(1)}>Bộ sưu tập</Text>
                      <Text style={{ color: '#fff', cursor: 'pointer' }} onClick={() => scrollToScene(3)}>Khám phá</Text>
                      </div>
                  </motion.div>
                </Col>
                <Col xs={12} md={6}>
                  <motion.div variants={pushUpVariant}>
                      <Title level={5} style={{ color: COLORS.gray, fontSize: 12, marginBottom: 20, letterSpacing: '1px' }}>DỊCH VỤ</Title>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <Text style={{ color: '#fff', cursor: 'pointer' }}>Phòng & Suite</Text>
                      <Text style={{ color: '#fff', cursor: 'pointer' }}>Nhà hàng</Text>
                      <Text style={{ color: '#fff', cursor: 'pointer' }}>Spa & Wellness</Text>
                      </div>
                  </motion.div>
                </Col>
                <Col xs={24} md={6}>
                  <motion.div variants={pushUpVariant}>
                      <Title level={5} style={{ color: COLORS.gray, fontSize: 12, marginBottom: 20, letterSpacing: '1px' }}>LIÊN HỆ</Title>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <Text style={{ color: '#fff' }}><EnvironmentOutlined style={{ marginRight: 10, color: COLORS.gold }}/> Sơn Trà, Đà Nẵng</Text>
                      <Text style={{ color: '#fff' }}><PhoneOutlined style={{ marginRight: 10, color: COLORS.gold }}/> +84 236 123 4567</Text>
                      <Text style={{ color: '#fff' }}><MailOutlined style={{ marginRight: 10, color: COLORS.gold }}/> info@grandhotel.com</Text>
                      </div>
                  </motion.div>
                </Col>
              </Row>
              
              <motion.div variants={pushUpVariant}>
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '40px 0 20px 0' }} />
                  <Row justify="space-between" align="middle" style={{ color: COLORS.gray, fontSize: 13 }}>
                      <Col>© 2026 Grand Hotel. All rights reserved.</Col>
                      <Col>
                      <Space size="large">
                          <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Privacy</Text>
                          <Text style={{ color: COLORS.gray, cursor: 'pointer' }}>Terms</Text>
                      </Space>
                      </Col>
                      <Col>
                          <Space size="middle">
                              <FacebookFilled style={{ fontSize: 16, cursor: 'pointer', color: '#fff' }} />
                              <InstagramFilled style={{ fontSize: 16, cursor: 'pointer', color: '#fff' }} />
                              <TwitterOutlined style={{ fontSize: 16, cursor: 'pointer', color: '#fff' }} />
                          </Space>
                      </Col>
                  </Row>
              </motion.div>
            </motion.div>
          </div>
        </SwiperSlide>

      </Swiper>
    </div>
  );
};

export default HomePage;