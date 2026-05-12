import React, { useRef, useState, useEffect } from 'react';
import { Layout, Button, Typography, Row, Col, Space, Tag, Avatar, Divider, Dropdown, DatePicker, InputNumber } from 'antd';
import { 
  ArrowRightOutlined, ArrowLeftOutlined, EnvironmentOutlined, 
  FacebookFilled, InstagramFilled, TwitterOutlined,
  PhoneOutlined, MailOutlined, UserOutlined, LogoutOutlined
} from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Mousewheel, Pagination } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios'; // 🚨 NHỚ PHẢI CÓ AXIOS ĐỂ GỌI API
import { getUserRoles } from '../utils/auth'; // 🔥 LẤY ROLES TỪ JWT TOKEN

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
// COMPONENT HIỆU ỨNG 
// ==========================================
const SunRays = React.memo(({ isActive }) => {
  if (!isActive) return null; 
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
  if (!isActive) return null; 
  const particles = Array.from({ length: 30 }).map((_, i) => ({ 
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

  // --- STATE DỮ LIỆU ---
  const [roomsData, setRoomsData] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // --- STATE DỊCH VỤ TIỆN ÍCH ---
  const [servicesData, setServicesData] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // --- STATE KHÁM PHÁ (ATTRACTIONS) ---
  const [attractionsData, setAttractionsData] = useState([]);
  const [loadingAttractions, setLoadingAttractions] = useState(true);

  // --- STATE TIN TỨC TRANG CHỦ ---
  const [newsData, setNewsData] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);


  // --- STATE NGƯỜI DÙNG (AUTH) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [activeScene, setActiveScene] = useState(0); 
  const [mainSwiper, setMainSwiper] = useState(null);
  // State quản lý bộ lọc tìm kiếm
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);

  // Hàm xử lý khi bấm nút Mũi Tên
  const handleSearchRooms = () => {
    const params = new URLSearchParams();
    if (checkIn) params.append('checkIn', checkIn.format('YYYY-MM-DD'));
    if (checkOut) params.append('checkOut', checkOut.format('YYYY-MM-DD'));
    if (guests) params.append('guests', guests);
    
    // Chuyển hướng sang trang Rooms kèm theo tham số lọc
    navigate(`/rooms?${params.toString()}`);
  }; 

  // 🚨 1. KIỂM TRA ĐĂNG NHẬP KHI VÀO TRANG
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const userObj = JSON.parse(userStr);
      // 🔥 Lấy roles từ JWT token (không phải từ user object)
      const rolesFromToken = getUserRoles();
      // Gắn roles vào user object để dùng trong component
      userObj.roles = rolesFromToken;
      setIsLoggedIn(true);
      setCurrentUser(userObj);
    }
  }, []);

  // 🚨 2. LẤY DỮ LIỆU PHÒNG TỪ SQL SERVER
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/RoomTypes/public`);
        setRoomsData(response.data);
      } catch (error) {
        console.error("Lỗi khi tải bộ sưu tập phòng:", error);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  // 🚨 3. LẤY DỮ LIỆU DỊCH VỤ TIỆN ÍCH TỪ SQL SERVER
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/Services/categories/public`);
        // Lọc ra các danh mục có ít nhất 1 dịch vụ
        setServicesData(res.data.filter(cat => cat.services && cat.services.length > 0));
      } catch (error) {
        console.error("Lỗi khi tải dịch vụ tiện ích:", error);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // 🚨 4. LẤY DỮ LIỆU KHÁM PHÁ (ATTRACTIONS) TỪ SQL SERVER
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/Attractions`);
        setAttractionsData(res.data || []);
      } catch (error) {
        console.error("Lỗi khi tải địa điểm du lịch:", error);
      } finally {
        setLoadingAttractions(false);
      }
    };
    fetchAttractions();
  }, []);

  // 🚨 5. LẤY DỮ LIỆU TIN TỨC TRANG CHỦ TỪ SQL SERVER
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/CMS/articles`);
        setNewsData(res.data || []);
      } catch (error) {
        console.error("Lỗi khi tải tin tức trang chủ:", error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchLatestNews();
  }, []);


  // --- HÀM XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.reload(); // Ép load lại trang cho sạch sẽ
  };

  // --- ĐỊNH DẠNG CHỨC VỤ ---
  const getRoleDisplay = () => {
    if (!currentUser?.roles) return { name: 'KHÁCH', color: COLORS.gray };
    if (currentUser.roles.includes('Admin')) return { name: 'QUẢN LÝ', color: '#f5222d' };
    if (currentUser.roles.includes('Receptionist')) return { name: 'LỄ TÂN', color: '#1890ff' };
    return { name: 'KHÁCH', color: COLORS.gray };
  };

  const roleInfo = getRoleDisplay();

  const menuItems = [
    { key: 0, label: 'Trang chủ', type: 'scroll' },
    { key: 1, label: 'Bộ sưu tập', type: 'scroll' },
    { key: 2, label: 'Tiện ích', type: 'scroll' },
    { key: 3, label: 'Khám phá', type: 'scroll' },
    { key: 4, label: 'Tin tức', type: 'scroll' },
    { key: 5, label: 'Liên hệ', type: 'scroll' },
  ];

  const scrollToScene = (index) => {
    if (mainSwiper) mainSwiper.slideTo(index);
  };

  // Hàm điều hướng đến trang phù hợp theo role
  const handleProfileNavigation = () => {
    if (currentUser?.roles?.includes('Admin')) {
      navigate('/admin/users');
    } else if (currentUser?.roles?.includes('Receptionist')) {
      navigate('/receptionist/dashboard');
    } else {
      navigate('/guest/dashboard');
    }
  };

  const userMenuItems = [
    { key: 'profile', label: 'Hồ sơ của tôi', icon: <UserOutlined />, onClick: handleProfileNavigation },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout }
  ];

  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
  const pushUpVariant = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } } };
  const bgScaleVariant = { hidden: { scale: 1.1 }, visible: { scale: 1, transition: { duration: 1.5, ease: "easeOut" } } };

  const glassStyle = {
    background: "rgba(10, 10, 10, 0.7)", backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.1)", 
    borderRadius: "24px", padding: isMobile ? "20px" : "40px"
  };

  return (
    <div style={{ height: "100vh", width: "100vw", background: COLORS.dark, fontFamily: "'Open Sans', sans-serif", overflow: "hidden" }}>
      
      {/* ========================================= */}
      {/* HEADER TỰ ĐỘNG ĐỔI TRẠNG THÁI LOGIN */}
      {/* ========================================= */}
      <Header style={{ 
        background: "rgba(0, 0, 0, 0.4)", display: "flex", justifyContent: "space-between", 
        alignItems: "center", padding: isMobile ? "0 20px" : "0 80px", height: "80px",
        position: "absolute", top: 0, zIndex: 1000, width: "100%", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ cursor: 'pointer' }} onClick={() => scrollToScene(0)}>
          <Title level={4} style={{ margin: 0, color: '#fff', letterSpacing: '2px', fontFamily: "'Noto Serif', serif" }}>IT HOTEL</Title>
        </div>
        
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', gap: isMobile ? '15px' : '40px' }}>
          {menuItems.map((item) => {
            const isScrollActive = item.type === 'scroll' && activeScene === item.key;
            return (
              <Text key={item.key} onClick={() => item.type === 'scroll' ? scrollToScene(item.key) : navigate(item.path)}
                style={{ color: isScrollActive ? COLORS.gold : '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 15, transition: "color 0.3s" }} 
                onMouseEnter={(e) => e.target.style.color = COLORS.gold}
                onMouseLeave={(e) => e.target.style.color = isScrollActive ? COLORS.gold : '#fff'}
              >
                {item.label}
              </Text>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* NẾU ĐÃ ĐĂNG NHẬP -> HIỆN AVATAR FACEBOOK STYLE */}
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer', padding: '5px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }}>
                  {/* Nếu không có ảnh avatar, hiện icon User trắng đen mặc định */}
                  <Avatar src={currentUser?.avatar} icon={!currentUser?.avatar && <UserOutlined />} style={{ backgroundColor: '#8c8c8c' }} />
                  {!isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <Text strong style={{ fontSize: 13, color: '#fff' }}>{currentUser?.fullName || currentUser?.name || 'Khách'}</Text>
                        <Text style={{ fontSize: 11, color: roleInfo.color, fontWeight: 'bold' }}>{roleInfo.name}</Text>
                    </div>
                  )}
              </div>
            </Dropdown>
          ) : (
            /* NẾU CHƯA ĐĂNG NHẬP -> HIỆN NÚT LOGIN */
            <Button type="primary" onClick={() => navigate('/login')} style={{ background: COLORS.gold, borderColor: COLORS.gold, fontWeight: 'bold', borderRadius: 20, color: COLORS.dark }}>
              ĐĂNG NHẬP
            </Button>
          )}
        </div>
      </Header>

      {/* ========================================= */}
      {/* MAIN LAYOUT */}
      {/* ========================================= */}
      <Swiper
        direction={"vertical"}
        mousewheel={{ forceToAxis: true, sensitivity: 1 }} 
        speed={1000} 
        onSwiper={setMainSwiper}
        onSlideChange={(swiper) => setActiveScene(swiper.activeIndex)}
        modules={[Mousewheel]}
        style={{ width: "100%", height: "100%" }}
      >
        
        {/* === SCENE 1: HERO === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <motion.div variants={bgScaleVariant} initial="hidden" animate={activeScene === 0 ? "visible" : "hidden"}
              style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.8) 100%)" }}></div>
            </motion.div>
            
            <SunRays isActive={activeScene === 0} />
            <BlingBling isActive={activeScene === 0} />
            
            <motion.div variants={staggerContainer} initial="hidden" animate={activeScene === 0 ? "visible" : "hidden"}
              style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 20px" }}>
              <motion.div variants={pushUpVariant}>
                 <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "3px", fontWeight: "bold", marginBottom: 20 }}>LUXURY RESORT & SPA — ĐÀ NẴNG</Text>
              </motion.div>
              <motion.div variants={pushUpVariant}>
                  <Title level={1} style={{ color: '#fff', fontSize: isMobile ? 40 : 80, fontWeight: 400, fontFamily: "'Noto Serif', serif", maxWidth: 900, lineHeight: 1.2 }}>Trải Nghiệm Nghỉ Dưỡng<br/>Đẳng Cấp Thế Giới</Title>
              </motion.div>
              <motion.div variants={pushUpVariant}>
                  <Paragraph style={{ color: '#e0e0e0', fontSize: 18, maxWidth: 600, marginTop: 20 }}>Nơi kiến trúc tinh tế gặp gỡ dịch vụ hoàn hảo. Mỗi khoảnh khắc tại IT Hotel đều mang đến sự bình yên.</Paragraph>
              </motion.div>
              
              <motion.div variants={pushUpVariant} style={{ width: "100%", maxWidth: 800 }}>
                  <div style={{ marginTop: 30, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, padding: "10px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      
                      {/* KHUNG NHẬP NGÀY NHẬN PHÒNG */}
                      <div style={{ flex: 1, minWidth: '120px', textAlign: 'left' }}>
                          <Text style={{color: COLORS.gray, display: 'block', fontSize: 12, marginBottom: 4}}>NHẬN PHÒNG</Text>
                          <DatePicker 
                              bordered={false} 
                              placeholder="Chọn ngày" 
                              style={{ padding: 0, width: '100%' }}
                              onChange={(date) => setCheckIn(date)}
                          />
                      </div>
                      
                      <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }}></div>
                      
                      {/* KHUNG NHẬP NGÀY TRẢ PHÒNG */}
                      <div style={{ flex: 1, minWidth: '120px', textAlign: 'left' }}>
                          <Text style={{color: COLORS.gray, display: 'block', fontSize: 12, marginBottom: 4}}>TRẢ PHÒNG</Text>
                          <DatePicker 
                              bordered={false} 
                              placeholder="Chọn ngày" 
                              style={{ padding: 0, width: '100%' }}
                              onChange={(date) => setCheckOut(date)}
                          />
                      </div>
                      
                      <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }}></div>
                      
                      {/* KHUNG NHẬP SỐ KHÁCH */}
                      <div style={{ flex: 1, minWidth: '100px', textAlign: 'left' }}>
                          <Text style={{color: COLORS.gray, display: 'block', fontSize: 12, marginBottom: 4}}>SỐ KHÁCH</Text>
                          <InputNumber 
                              min={1} max={10} 
                              value={guests}
                              bordered={false}
                              style={{ padding: 0, width: '50px' }}
                              onChange={(val) => setGuests(val)}
                          /> 
                          <Text strong style={{ color: '#fff' }}>khách</Text>
                      </div>

                      {/* NÚT TÌM KIẾM SẼ GỌI HÀM handleSearchRooms */}
                      <Button shape="circle" size="large" onClick={handleSearchRooms} style={{ background: '#fff', border: 'none', color: COLORS.dark }} icon={<ArrowRightOutlined />} />
                  
                  </div>
              </motion.div>

              <motion.div variants={pushUpVariant} style={{ position: "absolute", bottom: 60 }}>
                  <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: COLORS.gold, fontSize: 24, cursor: 'pointer' }} onClick={() => scrollToScene(1)}>↓</motion.div>
              </motion.div>
            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 2: BỘ SƯU TẬP PHÒNG (DÙNG DATA TỪ SQL) === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", alignItems: "center" }}>
            <motion.div variants={bgScaleVariant} initial="hidden" animate={activeScene === 1 ? "visible" : "hidden"}
              style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}></div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate={activeScene === 1 ? "visible" : "hidden"}
              style={{ position: "relative", width: "100%", padding: isMobile ? "80px 20px 20px" : "80px 80px 20px" }}>
              <motion.div variants={pushUpVariant} style={{ textAlign: "center", marginBottom: 30 }}>
                  <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "2px" }}>BỘ SƯU TẬP</Text>
                  <Title level={2} style={{ margin: "10px 0", fontSize: isMobile ? 32 : 48, color: '#fff', fontFamily: "'Noto Serif', serif" }}>Không Gian Nghỉ Dưỡng</Title>
              </motion.div>
              
              <motion.div variants={pushUpVariant}>
                {loadingRooms ? (
                  <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Text style={{ color: COLORS.gold }}>Đang tải bộ sưu tập phòng...</Text>
                  </div>
                ) : (
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={50}
                    slidesPerView={1}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    style={{ width: '100%', paddingBottom: '50px', '--swiper-pagination-color': COLORS.gold, '--swiper-pagination-bullet-inactive-color': COLORS.gray }}
                  >
                    {roomsData.map((room, index) => {
                      const roomIndex = (index + 1).toString().padStart(2, '0');
                      const totalRooms = roomsData.length.toString().padStart(2, '0');
                      const amenitiesArray = room.amenities ? room.amenities.split(',').map(a => a.trim()).slice(0, 3) : ['View Đẹp', 'Smart TV', 'Wifi'];
                      const roomImage = room.images && room.images.length > 0 ? room.images[0].imageUrl : "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop";

                      return (
                        <SwiperSlide key={room.id}>
                          {/* 👇 ĐÃ GẮN SỰ KIỆN CLICK VÀ HOVER CHO TOÀN BỘ KHUNG */}
                          <div 
                            style={{ ...glassStyle, cursor: 'pointer', transition: 'all 0.3s' }} 
                            onClick={() => navigate('/rooms')}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 30px rgba(193, 155, 74, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                          >
                            <Row gutter={[40, 40]} align="middle">
                                <Col xs={24} md={10}>
                                    <Text style={{ color: COLORS.gray }}>{roomIndex} —— {totalRooms}</Text>
                                    <Title level={2} style={{ fontFamily: "'Noto Serif', serif", marginTop: 10, color: '#fff' }}>{room.name}</Title>
                                    <Space style={{ color: COLORS.gray, marginBottom: 20 }}><span>🛏 {room.sizeSqm} m²</span><span>👤 {room.capacityAdults} NL - {room.capacityChildren} TE</span></Space>
                                    <Paragraph style={{ color: COLORS.gray, fontSize: 16 }}>{room.description || "Trải nghiệm không gian nghỉ dưỡng đẳng cấp."}</Paragraph>
                                    
                                    <Space size={[10, 10]} wrap style={{ marginBottom: 30 }}>
                                        {amenitiesArray.map(item => <Tag key={item} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 15px' }}>{item}</Tag>)}
                                    </Space>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
                                        <div>
                                          {room.originalPrice && room.originalPrice > room.basePrice && <Text delete style={{ color: COLORS.gray, display: 'block' }}>{new Intl.NumberFormat('vi-VN').format(room.originalPrice)}đ</Text>}
                                          <Title level={3} style={{ margin: 0, color: '#fff' }}>{new Intl.NumberFormat('vi-VN').format(room.basePrice)}<span style={{fontSize: 14, color: COLORS.gray}}>/đêm</span></Title>
                                        </div>
                                        
                                        {/* 👇 ĐÃ CHẶN NỔI BỌT CHO NÚT ĐẶT NGAY */}
                                        <Button 
                                          type="primary" 
                                          size="large" 
                                          onClick={(e) => {
                                            e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ div
                                            navigate('/booking');
                                          }} 
                                          style={{ background: COLORS.gold, border: "none", color: COLORS.dark, fontWeight: 'bold' }}
                                        >
                                          ĐẶT NGAY
                                        </Button>
                                    </div>
                                </Col>
                                <Col xs={24} md={14}>
                                    <img src={roomImage} alt={room.name} loading="lazy" style={{ width: '100%', height: isMobile ? "30vh" : "50vh", objectFit: 'cover', borderRadius: 16 }} />
                                </Col>
                            </Row>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                )}
              </motion.div>
            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 3: DỊCH VỤ TIỆN ÍCH — HORIZONTAL CARD SLIDER === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* Nền tối gradient */}
            <motion.div variants={bgScaleVariant} initial="hidden" animate={activeScene === 2 ? "visible" : "hidden"}
              style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1615460549969-36fa19521a4f?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,5,20,0.92) 0%, rgba(10,10,30,0.85) 100%)" }}></div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate={activeScene === 2 ? "visible" : "hidden"}
              style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: isMobile ? "80px 0 20px" : "80px 0 20px" }}>

              {/* HEADER */}
              <motion.div variants={pushUpVariant} style={{ textAlign: "center", marginBottom: isMobile ? 24 : 36, padding: "0 80px" }}>
                <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "4px", fontSize: 13 }}>TIỆN ÍCH & DỊCH VỤ</Text>
                <Title level={2} style={{ margin: "8px 0 0", fontSize: isMobile ? 28 : 44, color: '#fff', fontFamily: "'Noto Serif', serif", fontWeight: 300 }}>
                  Trải Nghiệm <span style={{ color: COLORS.gold }}>Đẳng Cấp</span>
                </Title>
              </motion.div>

              {/* CARD SLIDER */}
              <motion.div variants={pushUpVariant} style={{ flex: 1, minHeight: 0, paddingBottom: isMobile ? 40 : 50 }}>
                {loadingServices ? (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Text style={{ color: COLORS.gold, fontSize: 16 }}>⏳ Đang tải dịch vụ...</Text>
                  </div>
                ) : (
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={isMobile ? 16 : 24}
                    slidesPerView={isMobile ? 1.2 : 3.3}
                    centeredSlides={false}
                    autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    navigation={{
                      prevEl: '.service-prev-btn',
                      nextEl: '.service-next-btn',
                    }}
                    style={{ paddingLeft: isMobile ? 20 : 80, paddingRight: isMobile ? 20 : 80, height: isMobile ? '42vh' : '52vh' }}
                  >
                    {servicesData.map((category, index) => {
                      // Map ảnh theo từng danh mục (index-based fallback)
                      const categoryImages = [
                        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",   // Nhà Hàng
                        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop",   // Spa
                        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop", // Di Chuyển
                        "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=800&auto=format&fit=crop", // Giặt Ủi
                        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop", // Tour
                        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800&auto=format&fit=crop", // Hồ Bơi
                        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop", // Gym
                        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop", // Sự Kiện
                        "https://images.unsplash.com/photo-1560421683-6856ea585c78?q=80&w=800&auto=format&fit=crop",   // Trẻ Em
                        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",  // Cửa Hàng
                      ];
                      const categoryIcons = ['🍽️','💆','🚗','👔','🗺️','🏊','💪','🎉','👶','🛍️'];
                      const img = categoryImages[index % categoryImages.length];
                      const icon = categoryIcons[index % categoryIcons.length];

                      return (
                        <SwiperSlide key={category.id} style={{ height: '100%' }}>
                          <div style={{
                            position: 'relative', height: '100%', borderRadius: 20, overflow: 'hidden',
                            cursor: 'pointer', transition: 'transform 0.3s ease',
                          }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            {/* Ảnh nền */}
                            <img src={img} alt={category.name} loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

                            {/* Gradient overlay */}
                            <div style={{
                              position: 'absolute', inset: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
                            }} />

                            {/* Gold border top */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)` }} />

                            {/* Nội dung */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 20px' }}>
                              {/* Icon + Số lượng dịch vụ */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <span style={{ fontSize: 32, lineHeight: 1 }}>{icon}</span>
                                {category.services.length > 0 && (
                                  <span style={{
                                    background: COLORS.gold, color: COLORS.dark, borderRadius: 20,
                                    padding: '2px 10px', fontSize: 11, fontWeight: 700
                                  }}>
                                    {category.services.length} dịch vụ
                                  </span>
                                )}
                              </div>

                              {/* Tên danh mục */}
                              <Title level={4} style={{
                                color: '#fff', fontFamily: "'Noto Serif', serif",
                                margin: '0 0 10px', fontSize: isMobile ? 16 : 18, lineHeight: 1.3
                              }}>
                                {category.name}
                              </Title>

                              {/* Divider vàng */}
                              <div style={{ width: 40, height: 1, background: COLORS.gold, marginBottom: 12, opacity: 0.8 }} />

                              {/* Danh sách dịch vụ */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {category.services.length === 0 ? (
                                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontStyle: 'italic' }}>Sắp ra mắt...</Text>
                                ) : (
                                  category.services.slice(0, 3).map(svc => (
                                    <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>• {svc.name}</Text>
                                      <Text style={{ color: COLORS.gold, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
                                        {svc.price?.toLocaleString('vi-VN')}đ
                                      </Text>
                                    </div>
                                  ))
                                )}
                                {category.services.length > 3 && (
                                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>+{category.services.length - 3} dịch vụ khác</Text>
                                )}
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                )}
              </motion.div>

              {/* Navigation buttons + đếm */}
              <motion.div variants={pushUpVariant} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 0, padding: '0 80px 16px' }}>
                <button className="service-prev-btn" style={{
                  width: 44, height: 44, borderRadius: '50%', border: `1px solid ${COLORS.gold}`,
                  background: 'transparent', color: COLORS.gold, cursor: 'pointer', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>←</button>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 2 }}>
                  {servicesData.length} DANH MỤC
                </Text>
                <button className="service-next-btn" style={{
                  width: 44, height: 44, borderRadius: '50%', border: `1px solid ${COLORS.gold}`,
                  background: COLORS.gold, color: COLORS.dark, cursor: 'pointer', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>→</button>
              </motion.div>

            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 4: KHÁM PHÁ === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.div variants={bgScaleVariant} initial="hidden" animate={activeScene === 3 ? "visible" : "hidden"}
              style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)" }}></div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate={activeScene === 3 ? "visible" : "hidden"}
              style={{ position: "relative", padding: isMobile ? "80px 20px 20px" : "80px 80px 20px" }}>
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
              
              {loadingAttractions ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Text style={{ color: COLORS.gold }}>Đang tải địa điểm du lịch...</Text>
                </div>
              ) : (
                <motion.div variants={pushUpVariant}>
                    <Swiper modules={[Navigation]} spaceBetween={30} slidesPerView={isMobile ? 1 : 3} navigation={{ prevEl: '.destination-nav .prev-btn', nextEl: '.destination-nav .next-btn' }}>
                        {attractionsData.map((dest, index) => {
                          const fallbackImages = [
                            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1583417267846-e58bf43e80b2?q=80&w=1000&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1596395825390-e55500e57ba5?q=80&w=1000&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop",
                          ];
                          const imgUrl = fallbackImages[index % fallbackImages.length];
                          return (
                            <SwiperSlide key={dest.id}>
                                <div style={{ position: 'relative', height: isMobile ? "40vh" : "55vh", borderRadius: 16, overflow: "hidden" }}>
                                    <img alt={dest.name} src={imgUrl} loading="lazy" style={{ width: '100%', height: '100%', objectFit: "cover" }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }}></div>
                                    <div style={{ position: 'absolute', bottom: 30, left: 30, right: 30, color: '#fff' }}>
                                        <Text style={{ color: COLORS.gold, fontSize: 12 }}>
                                          <EnvironmentOutlined /> {dest.distanceKm ? `${dest.distanceKm} KM` : 'Lân cận'}
                                        </Text>
                                        <Title level={2} style={{ textAlign: "center", marginBottom: "40px", fontWeight: "bold" }}>Vì Sao Chọn IT HOTEL?</Title>
                                        <Text style={{ color: '#e0e0e0', fontSize: 13 }}>{dest.description}</Text>
                                    </div>
                                </div>
                            </SwiperSlide>
                          );
                        })}
                    </Swiper>
                </motion.div>
              )}
            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 5: TIN TỨC PREVIEW BANNER === */}
        <SwiperSlide>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.div variants={bgScaleVariant} initial="hidden" animate={activeScene === 4 ? "visible" : "hidden"}
              style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)" }}></div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate={activeScene === 4 ? "visible" : "hidden"}
              style={{ position: "relative", padding: isMobile ? "80px 20px 20px" : "80px 80px 20px" }}>
              <motion.div variants={pushUpVariant} style={{ marginBottom: 40 }}>
                <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "2px" }}>TIN TỨC & SỰ KIỆN</Text>
                <Title level={2} style={{ margin: "10px 0 0 0", fontSize: isMobile ? 32 : 48, color: '#fff', fontFamily: "'Noto Serif', serif" }}>Truyền Thông & Ưu Đãi</Title>
              </motion.div>

              {loadingNews ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Text style={{ color: COLORS.gold }}>Đang tải tin tức mới nhất...</Text>
                </div>
              ) : (
                <motion.div variants={pushUpVariant}>
                  <Row gutter={[40, 40]} align="middle">
                    <Col xs={24} lg={12}>
                      {newsData.length > 0 ? (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 24,
                          padding: isMobile ? '24px' : '40px',
                          backdropFilter: 'blur(10px)',
                          textAlign: 'left'
                        }}>
                          <Tag style={{ background: COLORS.gold, color: COLORS.dark, border: 'none', fontWeight: 'bold', padding: '4px 12px', marginBottom: 20 }}>
                            TIN MỚI NHẤT
                          </Tag>
                          <Title level={3} style={{ color: '#fff', fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 20 : 28, lineHeight: 1.4, margin: '0 0 15px 0', fontWeight: 400 }}>
                            {newsData[0].title}
                          </Title>
                          <Paragraph ellipsis={{ rows: 3 }} style={{ color: COLORS.gray, fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
                            {newsData[0].content}
                          </Paragraph>
                          <Button 
                            type="primary" 
                            size="large"
                            onClick={() => navigate('/news')}
                            style={{ background: COLORS.gold, borderColor: COLORS.gold, color: COLORS.dark, fontWeight: 'bold', borderRadius: 24, padding: '0 35px' }}
                          >
                            XEM CHI TIẾT →
                          </Button>
                        </div>
                      ) : (
                        <div style={{ color: COLORS.gray }}>Chưa có bài đăng nào được cập nhật.</div>
                      )}
                    </Col>

                    <Col xs={24} lg={12}>
                      <div style={{
                        position: 'relative',
                        height: isMobile ? '220px' : '320px',
                        borderRadius: 24,
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}>
                        <img 
                          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop" 
                          alt="Grand Media" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          padding: '30px',
                          textAlign: 'left'
                        }}>
                          <Title level={4} style={{ color: '#fff', fontFamily: "'Noto Serif', serif", margin: '0 0 10px 0', fontWeight: 300 }}>Cổng Thông Tin IT HOTEL</Title>
                          <Text style={{ color: COLORS.gray, fontSize: 14 }}>Tìm hiểu thêm nhiều chương trình ưu đãi nghỉ dưỡng hấp dẫn khác.</Text>
                          <Text 
                            onClick={() => navigate('/news')} 
                            style={{ color: COLORS.gold, marginTop: 15, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            XEM TOÀN BỘ TIN TỨC →
                          </Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </motion.div>
              )}
            </motion.div>
          </div>
        </SwiperSlide>

        {/* === SCENE 6: FOOTER === */}
        <SwiperSlide style={{ background: "#050505" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.div variants={staggerContainer} initial="hidden" animate={activeScene === 5 ? "visible" : "hidden"} style={{ padding: isMobile ? "0 20px" : "0 80px" }}>
              <Row gutter={[40, 40]}>
                <Col xs={24} md={6}>
                  <motion.div variants={pushUpVariant}>
                      <Title level={4} style={{ margin: "0 0 20px 0", color: '#fff', letterSpacing: '2px', fontFamily: "'Noto Serif', serif" }}>IT HOTEL</Title>
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
                      <Text style={{ color: '#fff', cursor: 'pointer' }} onClick={() => scrollToScene(4)}>Tin tức</Text>
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
                      <Text style={{ color: '#fff' }}><MailOutlined style={{ marginRight: 10, color: COLORS.gold }}/> info@ithotel.com</Text>
                      </div>
                  </motion.div>
                </Col>
              </Row>
              
              <motion.div variants={pushUpVariant}>
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '40px 0 20px 0' }} />
                  <Row justify="space-between" align="middle" style={{ color: COLORS.gray, fontSize: 13 }}>
                      <Col>Khám phá vẻ đẹp bất tận cùng IT HOTEL. All rights reserved.</Col>
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