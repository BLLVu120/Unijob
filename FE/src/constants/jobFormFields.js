export const jobFormFields = [
    { 
        name: "title", 
        label: 'Tiêu đề tin tuyển dụng',
        placeholder: 'Nhập tiêu đề tin tuyển dụng',
        required: true,
    },
    {
        name: "job_type",
        label: "Hình thức làm việc",
        type: "select",
        options: [
            { label: "Làm tại công ty", value: "offline" },
            { label: "Làm từ xa", value: "remote" },
            { label: "Hybrid (kết hợp)", value: "hybrid" }
        ]
    },
    { 
        name: "experience",
        label: 'Kinh nghiệm yêu cầu',
        type: 'select',
        options: [
            { label: "Không yêu cầu", value: 0 },
            { label: "1 năm", value: 1 },
            { label: "2 năm", value: 2 }
        ],
    },
    { 
        name: "location",
        label: 'Địa điểm làm việc',
        type: 'select',
        options: ['TP. Hồ Chí Minh', 'Hà Nội'],
        },
    { 
        name: "num_slot",
        label: 'Số lượng cần tuyển',
        type: 'number',
        required: true,
    },
    { 
        name: "salary_min",
        label: 'Mức lương tối thiểu (đồng/giờ)',
        type: 'number',
        required: true,
    },
    { 
        name: "salary_max",
        label: 'Mức lương tối đa (đồng/giờ)',
        type: 'number',
        required: true,
    },
    { 
        name: "expiry_date",
        label: 'Hạn nộp hồ sơ',
        type: 'date',
    },
    { 
        name: "education_level",
        label: 'Trình độ học vấn',
        type: 'select',
        options: ['Không yêu cầu', 'THPT', 'Cao đẳng'],
    },
    { 
        name: "role",
        label: 'Cấp bậc',
        type: 'select',
        options: ['Nhân viên', 'Trưởng nhóm'],
    }
]

export const getJobFieldKey = (field) => {
  switch (field) {
    case "Mô tả công việc": return "description";
    case "Yêu cầu ứng viên": return "requirements";
    case "Quyền lợi": return "benefits";
    case "Thời gian làm việc": return "working_shifts";
    default: return "";
  }
};

export const jobExperienceLabel = {
  0: "Không kinh nghiệm",
  1: "1 năm",
  2: "2 năm"
};
