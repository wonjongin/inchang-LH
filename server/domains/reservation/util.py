import colorsys
import os

def year_to_yearcode(year: int) -> str:
    # 2025 -> L
    # 2026 -> M
    # 2027 -> N

    return chr(ord('A') + year - 2014)
    

def get_color_by_int(index: int) -> str:
    """
    바탕색으로 쓰기 좋은 색 256개 중 인덱스에 해당하는 색을 반환합니다.
    HSL 색 공간을 사용하여 색상들이 고르게 분산되도록 했습니다.
    
    Args:
        index: 0-255 사이의 정수
        
    Returns:
        색상 코드 (예: "F2F2F2")
    """
    # 인덱스를 0-255 범위로 제한
    index = index % 256
    
    # HSL 색 공간을 사용하여 256개의 색상을 고르게 분산
    # H(색상): 0-360도, S(채도): 0.3-0.6 (연한 색상), L(명도): 0.85-0.95 (밝은 색상)
    
    # 골든 비율을 사용하여 색상 분산 최적화
    golden_ratio = 0.618033988749895
    
    # 색상(H): 골든 비율을 사용하여 균등하게 분산
    hue = (index * golden_ratio * 360) % 360
    
    # 채도(S): 0.5-0.8 범위에서 변화 (쨍하고 선명한 색상)
    saturation = 0.5 + (index % 15) * 0.02
    
    # 명도(L): 0.85-0.96 범위에서 변화 (밝고 부드러운 색상)
    lightness = 0.85 + (index % 11) * 0.01
    
    # HSL을 RGB로 변환
    rgb = colorsys.hls_to_rgb(hue / 360, lightness, saturation)
    
    # RGB 값을 0-255 범위의 정수로 변환하고 16진수로 포맷
    r = int(rgb[0] * 255)
    g = int(rgb[1] * 255)
    b = int(rgb[2] * 255)
    
    return f"{r:02X}{g:02X}{b:02X}"

def exists_reservation_photo(reservation_id: int) -> bool:
    return os.path.exists(f"data/reservation_photos/rp_{reservation_id}.pdf")