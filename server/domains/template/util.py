from openpyxl import load_workbook
import os
from models.models import Reservation, Template


def generate_certificate_template(t: Template, r: Reservation):
    workbook = load_workbook(f"data/templates/{t.id}.xlsx")
    sheet = workbook['Sheet1']
    fmt = t.fmt.split('\n')
    # fmt 형식: 셀주소\n값\n셀주소\n값...
    # 짝수 인덱스(0, 2, 4, ...): 셀 주소
    # 홀수 인덱스(1, 3, 5, ...): 값 (플레이스홀더 포함)
    for i in range(0, len(fmt) - 1, 2):
        cell_address = fmt[i].strip()  # 셀 주소 (예: "B4")
        value_template = fmt[i + 1].strip()  # 값 템플릿 (예: "{{내용}}")
        
        if not cell_address or not value_template:
            continue
            
        # 플레이스홀더 치환
        value = (value_template
            .replace('{{cotis}}', r.cotis or '')
            .replace('{{연도}}', str(r.reserved_at.year))
            .replace('{{월}}', str(r.reserved_at.month))
            .replace('{{일}}', str(r.reserved_at.day))
            .replace('{{주소}}', r.location.address or '')
            .replace('{{연락처}}', r.location.tel or '')
            .replace('{{내용}}', r.description or '')
            .replace('{{단지명}}', r.location.name)
            .replace('{{업체명}}', r.vendor.name)
            .replace('{{n}}', '\n'))
        
        sheet[cell_address].value = value
        
    if not os.path.exists(f"data/certificates_template"):
        os.makedirs(f"data/certificates_template", exist_ok=True)
    workbook.save(f"data/certificates_template/{r.id}.xlsx")
    return f"data/certificates_template/{r.id}.xlsx"