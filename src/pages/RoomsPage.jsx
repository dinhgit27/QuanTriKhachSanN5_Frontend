import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Space, Tag, Spin, Divider, Slider, Checkbox, message } from 'antd';
import { ArrowRightOutlined, FilterOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserRoles } from "../utils/auth";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const COLORS = {
  gold: "#c19b4a",
  dark: "#0a0a0a",
  gray: "#b3b3b3",
  cardBg: "rgba(25, 25, 25, 0.8)",
  border: "rgba(255, 255, 255, 0.1)"
};

// Hàm hỗ trợ format tiền tệ cho đẹp
const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

const RoomsPage = () => {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  // 1. STATE QUẢN LÝ DỮ LIỆU
  const [allRooms, setAllRooms] = useState([]); // Chứa dữ liệu gốc từ DB (không bao giờ sửa)
  const [filteredRooms, setFilteredRooms] = useState([]); // Chứa dữ liệu sau khi lọc (để in ra màn hình)
  const [loading, setLoading] = useState(true);
  // Lấy số khách từ URL (do HomePage truyền sang)
  const [searchParams] = useSearchParams();
  const guestQuery = searchParams.get('guests');

  // GỌI API VÀ LỌC TỰ ĐỘNG NẾU CÓ DỮ LIỆU TỪ TRANG CHỦ GỬI SANG
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/RoomTypes/public`);
        setAllRooms(response.data);
        
        let initialFiltered = response.data;

        if (guestQuery) {
          const guestCount = parseInt(guestQuery);
          initialFiltered = response.data.filter(room => {
            const totalCap = room.capacityAdults + (room.capacityChildren || 0);
            return totalCap >= guestCount;
          });
        }

        setFilteredRooms(initialFiltered);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phòng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [guestQuery]);

  // STATE QUẢN LÝ BỘ LỌC
  const [priceRange, setPriceRange] = useState([0, 10000000]); // Mặc định từ 0 đến 10 triệu
  const [selectedCapacities, setSelectedCapacities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // HÀM XỬ LÝ KHI BẤM "ĐẶT NGAY"
  const handleBookClick = (room) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Vui lòng đăng nhập với tài khoản Khách hàng (Guest) để đặt phòng trực tuyến.");
      navigate("/login");
      return;
    }
    const roles = getUserRoles();
    if (!roles.includes("Guest")) {
      message.error("Chỉ có tài khoản Khách hàng (Guest) mới có quyền đặt phòng trực tuyến!");
      return;
    }
    navigate(`/guest/book-room?roomType=${encodeURIComponent(room.name)}`);
  };

  // ==========================================
  // HÀM XỬ LÝ KHI BẤM NÚT "ÁP DỤNG BỘ LỌC"
  // ==========================================
  const handleApplyFilter = () => {
    const result = allRooms.filter(room => {
      // 1. Lọc theo Khoảng Giá
      if (room.basePrice < priceRange[0] || room.basePrice > priceRange[1]) {
        return false;
      }

      // 2. Lọc theo Sức Chứa (Capacity)
      const totalGuests = room.capacityAdults + (room.capacityChildren || 0);
      if (selectedCapacities.length > 0) {
        let matchCapacity = false;
        if (selectedCapacities.includes("1") && totalGuests >= 1 && totalGuests <= 2) matchCapacity = true;
        if (selectedCapacities.includes("2") && totalGuests >= 3 && totalGuests <= 4) matchCapacity = true;
        if (selectedCapacities.includes("3") && totalGuests >= 5) matchCapacity = true;
        
        if (!matchCapacity) return false; // Trượt bài test sức chứa thì loại luôn phòng này
      }

      // 3. Lọc theo Tiện nghi (Amenities)
      // Chuyển toàn bộ tên và mô tả phòng thành chữ thường để dễ tìm kiếm từ khóa
      if (selectedAmenities.length > 0) {
        const roomText = `${room.name} ${room.description} ${room.amenities || ''}`.toLowerCase();
        let matchAmenity = false;
        
        if (selectedAmenities.includes("view") && (roomText.includes("biển") || roomText.includes("view"))) matchAmenity = true;
        if (selectedAmenities.includes("bath") && (roomText.includes("bồn tắm") || roomText.includes("jacuzzi"))) matchAmenity = true;
        if (selectedAmenities.includes("balcony") && roomText.includes("ban công")) matchAmenity = true;
        if (selectedAmenities.includes("pool") && roomText.includes("hồ bơi")) matchAmenity = true;

        if (!matchAmenity) return false;
      }

      return true; // Vượt qua hết các bộ lọc thì giữ lại phòng này
    });

    setFilteredRooms(result); // Cập nhật lại danh sách hiển thị
  };

  return (
    <Layout style={{ minHeight: "100vh", background: COLORS.dark, fontFamily: "'Open Sans', sans-serif" }}>
      
      {/* 1. HERO BANNER MỚI TÔNG SANG TRỌNG */}
      <div style={{ 
        position: "relative", height: "40vh", minHeight: "300px",
        // 👇 Link ảnh Cloud từ Unsplash đã được tối ưu hóa siêu mượt
        backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop')",
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center"
      }}>
        {/* Lớp phủ màu đen làm chìm ảnh, nổi bật chữ vàng */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }}></div>
        
        <div style={{ position: "relative", zIndex: 1, padding: "0 20px" }}>
          <Text style={{ color: COLORS.gold, textTransform: "uppercase", letterSpacing: "3px", fontWeight: "bold" }}>KHÁM PHÁ</Text>
          <Title level={1} style={{ color: '#fff', fontSize: isMobile ? 36 : 56, fontFamily: "'Noto Serif', serif", margin: "10px 0" }}>
            Danh Sách Phòng
          </Title>
          <Paragraph style={{ color: '#e0e0e0', fontSize: 16 }}>Lựa chọn không gian nghỉ dưỡng hoàn hảo cho kỳ nghỉ của bạn</Paragraph>
        </div>
      </div>

      <Content style={{ padding: isMobile ? "40px 20px" : "60px 80px", background: COLORS.dark }}>
        <Button type="link" onClick={() => navigate('/')} style={{ color: COLORS.gold, padding: 0, marginBottom: 30 }}>
          ← QUAY LẠI TRANG CHỦ
        </Button>

        <Row gutter={[40, 40]}>
          
          {/* ======================================================== */}
          {/* CỘT TRÁI: THANH BỘ LỌC */}
          {/* ======================================================== */}
          <Col xs={24} lg={6}>
            <div style={{ 
              background: COLORS.cardBg, 
              border: `1px solid ${COLORS.border}`, 
              borderRadius: 16, 
              padding: '24px',
              position: 'sticky', top: '100px'
            }}>
              <Title level={4} style={{ color: '#fff', marginTop: 0, fontFamily: "'Noto Serif', serif" }}>
                <FilterOutlined style={{ color: COLORS.gold, marginRight: 10 }} />
                Bộ Lọc Tìm Kiếm
              </Title>
              <Divider style={{ borderColor: COLORS.border, margin: '15px 0' }} />

              {/* LỌC THEO GIÁ */}
              <div style={{ marginBottom: 25 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                  <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>Khoảng giá</Text>
                  <Text style={{ color: COLORS.gray, fontSize: 12 }}>/ đêm</Text>
                </div>
                
                {/* Thanh Slider chỉnh chu: Báo giá real-time */}
                <Slider 
                  range 
                  min={0}
                  max={10000000} 
                  step={100000}
                  defaultValue={[0, 10000000]}
                  onChange={(val) => setPriceRange(val)}
                  tooltip={{ formatter: formatCurrency }}
                  trackStyle={[{ backgroundColor: COLORS.gold }]}
                  handleStyle={[{ borderColor: COLORS.gold, backgroundColor: COLORS.dark }, { borderColor: COLORS.gold, backgroundColor: COLORS.dark }]}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 13 }}>{formatCurrency(priceRange[0])}</Text>
                  <Text style={{ color: COLORS.gray }}>-</Text>
                  <Text style={{ color: '#fff', fontSize: 13 }}>{formatCurrency(priceRange[1])}</Text>
                </div>
              </div>

              {/* LỌC SỨC CHỨA */}
              <div style={{ marginBottom: 25 }}>
                <Text style={{ color: COLORS.gold, fontWeight: 'bold', display: 'block', marginBottom: 15 }}>Sức chứa</Text>
                <Checkbox.Group 
                  style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
                  onChange={(checkedValues) => setSelectedCapacities(checkedValues)}
                >
                  <Checkbox value="1"><span style={{ color: '#fff' }}>1 - 2 Khách</span></Checkbox>
                  <Checkbox value="2"><span style={{ color: '#fff' }}>3 - 4 Khách</span></Checkbox>
                  <Checkbox value="3"><span style={{ color: '#fff' }}>5+ Khách (Gia đình)</span></Checkbox>
                </Checkbox.Group>
              </div>

              {/* LỌC TIỆN ÍCH */}
              <div style={{ marginBottom: 25 }}>
                <Text style={{ color: COLORS.gold, fontWeight: 'bold', display: 'block', marginBottom: 15 }}>Tiện nghi phòng</Text>
                <Checkbox.Group 
                  style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
                  onChange={(checkedValues) => setSelectedAmenities(checkedValues)}
                >
                  <Checkbox value="view"><span style={{ color: '#fff' }}>View Hướng Biển</span></Checkbox>
                  <Checkbox value="bath"><span style={{ color: '#fff' }}>Bồn tắm sục Jacuzzi</span></Checkbox>
                  <Checkbox value="balcony"><span style={{ color: '#fff' }}>Ban công riêng</span></Checkbox>
                  <Checkbox value="pool"><span style={{ color: '#fff' }}>Hồ bơi riêng</span></Checkbox>
                </Checkbox.Group>
              </div>

              {/* NÚT ÁP DỤNG */}
              <Button 
                type="primary" 
                block 
                size="large" 
                onClick={handleApplyFilter}
                style={{ background: COLORS.gold, borderColor: COLORS.gold, color: COLORS.dark, fontWeight: 'bold' }}
              >
                ÁP DỤNG BỘ LỌC
              </Button>
            </div>
          </Col>

          {/* ======================================================== */}
          {/* CỘT PHẢI: DANH SÁCH PHÒNG (NẰM NGANG) */}
          {/* ======================================================== */}
          <Col xs={24} lg={18}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <Text style={{ color: COLORS.gold, display: 'block', marginTop: 20 }}>Đang tải danh sách phòng cao cấp...</Text>
              </div>
            ) : filteredRooms.length === 0 ? (
              /* TRƯỜNG HỢP LỌC KHÔNG RA KẾT QUẢ NÀO */
              <div style={{ textAlign: 'center', padding: '100px 0', background: COLORS.cardBg, borderRadius: 16, border: `1px dashed ${COLORS.gray}` }}>
                <Title level={4} style={{ color: COLORS.gold }}>Không tìm thấy phòng phù hợp!</Title>
                <Text style={{ color: COLORS.gray }}>Vui lòng điều chỉnh lại khoảng giá hoặc bớt điều kiện lọc.</Text>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {filteredRooms.map((room) => {
                  const amenitiesArray = room.amenities ? room.amenities.split(',').map(a => a.trim()).slice(0, 4) : ['View Đẹp', 'Smart TV', 'Wifi', 'Minibar'];
                  const roomImage = room.images && room.images.length > 0 ? room.images[0].imageUrl : "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop";

                  return (
                    <Card 
                      key={room.id}
                      hoverable
                      bodyStyle={{ padding: 0 }}
                      style={{ 
                        background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, 
                        borderRadius: 16, overflow: 'hidden'
                      }}
                    >
                      <Row style={{ minHeight: '100%' }}>
                        {/* Phần Hình Ảnh */}
                        <Col xs={24} sm={10} md={8}>
                          <img alt={room.name} src={roomImage} style={{ width: '100%', height: '100%', minHeight: '280px', objectFit: 'cover' }} />
                        </Col>

                        {/* Phần Thông Tin */}
                        <Col xs={24} sm={14} md={16} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <Space style={{ color: COLORS.gold, marginBottom: 5, fontSize: 13, fontWeight: 'bold' }}>
                                  <span>🛏 {room.sizeSqm} m²</span>
                                  <span>|</span>
                                  <span>👤 Tối đa {room.capacityAdults + (room.capacityChildren || 0)} khách</span>
                                </Space>
                                <Title level={3} style={{ fontFamily: "'Noto Serif', serif", color: '#fff', marginTop: 0, marginBottom: 10 }}>
                                  {room.name}
                                </Title>
                              </div>
                            </div>
                            
                            <Paragraph ellipsis={{ rows: 2 }} style={{ color: COLORS.gray, marginBottom: 15 }}>
                              {room.description || "Tận hưởng không gian sang trọng với thiết kế tinh tế, ánh sáng tự nhiên và dịch vụ chăm sóc chuẩn 5 sao."}
                            </Paragraph>

                            <Space size={[8, 8]} wrap style={{ marginBottom: 20 }}>
                              {amenitiesArray.map(item => (
                                <Tag key={item} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.border}`, color: COLORS.gray, padding: '4px 10px' }}>{item}</Tag>
                              ))}
                            </Space>

                            {/* Khu vực Giá và Nút Đặt */}
                            <div style={{ marginTop: 'auto', borderTop: `1px solid ${COLORS.border}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <div>
                                {room.originalPrice && room.originalPrice > room.basePrice && (
                                  <Text delete style={{ color: COLORS.gray, display: 'block', fontSize: 13 }}>{formatCurrency(room.originalPrice)}</Text>
                                )}
                                <Text style={{ color: COLORS.gold, fontSize: 24, fontWeight: 'bold' }}>
                                  {formatCurrency(room.basePrice)} <span style={{ fontSize: 14, color: COLORS.gray, fontWeight: 'normal' }}>/đêm</span>
                                </Text>
                              </div>
                              <Button 
                                type="primary" 
                                size="large"
                                onClick={() => handleBookClick(room)}
                                style={{ background: COLORS.gold, borderColor: COLORS.gold, color: COLORS.dark, fontWeight: 'bold', padding: '0 30px' }}
                              >
                                ĐẶT NGAY <ArrowRightOutlined />
                              </Button>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
              </div>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RoomsPage;